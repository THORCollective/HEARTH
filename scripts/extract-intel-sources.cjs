#!/usr/bin/env node
/**
 * HEARTH Context Graph — Intel Source Extraction
 * Scans hypothesis markdown files in Flames/, Embers/, Alchemy/ and extracts:
 *   - CVE IDs (CVE-YYYY-NNNN)
 *   - URLs to known advisory sources (CISA, Microsoft, etc.)
 *   - Named report/advisory references
 *
 * Creates IntelSource nodes with INSPIRED_BY edges from hypotheses.
 * Merges results into public/context-graph-data.json
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'public', 'context-graph-data.json');
const HYPOTHESIS_DIRS = ['Flames', 'Embers', 'Alchemy'];

// Patterns for intel sources
const CVE_RE = /CVE-\d{4}-\d{4,}/g;

// Advisory domains we recognize as intel sources
const ADVISORY_DOMAINS = [
  'cisa.gov',
  'microsoft.com/security',
  'msrc.microsoft.com',
  'securelist.com',
  'unit42.paloaltonetworks.com',
  'mandiant.com',
  'crowdstrike.com',
  'sentinelone.com',
  'trellix.com',
  'symantec-enterprise-blogs.security.com',
  'blog.google/threat-analysis-group',
  'thedfirreport.com',
  'elastic.co/security-labs',
  'blackswan-cybersecurity.com',
  'cert.gov.ua',
  'ncsc.gov.uk',
];

// URL pattern — match markdown links and bare URLs
const URL_RE = /https?:\/\/[^\s)>\]"]+/g;

function isAdvisoryUrl(url) {
  const lower = url.toLowerCase();
  return ADVISORY_DOMAINS.some(d => lower.includes(d));
}

function extractSourceLabel(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');

    // CISA advisories
    if (host.includes('cisa.gov')) {
      const match = url.match(/aa\d{2}-\d{3}[a-z]?/i);
      if (match) return `CISA Advisory ${match[0].toUpperCase()}`;
      if (url.includes('known-exploited-vulnerabilities')) return 'CISA KEV Catalog';
      return 'CISA Advisory';
    }
    // MSRC
    if (host.includes('msrc.microsoft.com')) {
      const cveMatch = url.match(/CVE-\d{4}-\d+/i);
      if (cveMatch) return `MSRC ${cveMatch[0]}`;
      return 'Microsoft Security Response Center';
    }
    // Generic — use domain name
    const domainLabel = host.split('.').slice(-2, -1)[0];
    return domainLabel.charAt(0).toUpperCase() + domainLabel.slice(1) + ' Advisory';
  } catch {
    return 'External Advisory';
  }
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath, '.md');
  const sources = new Map(); // key → { id, label, url?, type }

  // Extract CVEs
  const cves = content.match(CVE_RE) || [];
  for (const cve of cves) {
    const key = cve.toUpperCase();
    if (!sources.has(key)) {
      sources.set(key, {
        id: `intel:${key}`,
        type: 'intel_source',
        subtype: 'cve',
        label: key,
        url: `https://nvd.nist.gov/vuln/detail/${key}`,
        hypothesisId: filename,
      });
    }
  }

  // Extract advisory URLs
  const urls = content.match(URL_RE) || [];
  for (let url of urls) {
    // Clean trailing punctuation
    url = url.replace(/[.,;:!?)]+$/, '');
    if (!isAdvisoryUrl(url)) continue;
    const key = url;
    if (!sources.has(key)) {
      sources.set(key, {
        id: `intel:${Buffer.from(url).toString('base64url').slice(0, 40)}`,
        type: 'intel_source',
        subtype: 'advisory',
        label: extractSourceLabel(url),
        url: url,
        hypothesisId: filename,
      });
    }
  }

  return Array.from(sources.values());
}

function main() {
  console.log('HEARTH Intel Source Extraction');
  console.log('=' .repeat(50));

  // Load existing graph
  if (!fs.existsSync(DATA_PATH)) {
    console.error(`ERROR: ${DATA_PATH} not found. Run enrich-context-graph.cjs first.`);
    process.exit(1);
  }

  const graph = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  const existingNodeIds = new Set(graph.nodes.map(n => n.id));
  const existingEdgeKeys = new Set(
    graph.edges.map(e => `${e.source}→${e.target}→${e.type}`)
  );

  let totalSources = 0;
  let totalEdges = 0;
  let filesScanned = 0;

  for (const dir of HYPOTHESIS_DIRS) {
    const dirPath = path.join(ROOT, dir);
    if (!fs.existsSync(dirPath)) {
      console.log(`  Skipping ${dir}/ (not found)`);
      continue;
    }

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.md'));
    console.log(`\nScanning ${dir}/ — ${files.length} files`);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const sources = scanFile(filePath);
      filesScanned++;

      for (const src of sources) {
        // Add node if new
        if (!existingNodeIds.has(src.id)) {
          graph.nodes.push({
            id: src.id,
            type: src.type,
            subtype: src.subtype,
            label: src.label,
            url: src.url,
          });
          existingNodeIds.add(src.id);
          totalSources++;
        }

        // Add INSPIRED_BY edge: hypothesis → intel_source
        const edgeKey = `${src.hypothesisId}→${src.id}→INSPIRED_BY`;
        if (!existingEdgeKeys.has(edgeKey)) {
          graph.edges.push({
            source: src.hypothesisId,
            target: src.id,
            type: 'INSPIRED_BY',
          });
          existingEdgeKeys.add(edgeKey);
          totalEdges++;
        }
      }
    }
  }

  // Update stats
  const intelNodes = graph.nodes.filter(n => n.type === 'intel_source');
  graph.stats.intel_sources = intelNodes.length;
  graph.stats.totalNodes = graph.nodes.length;
  graph.stats.totalEdges = graph.edges.length;

  // Write back
  fs.writeFileSync(DATA_PATH, JSON.stringify(graph, null, 2) + '\n');

  console.log('\n' + '=' .repeat(50));
  console.log(`Files scanned:     ${filesScanned}`);
  console.log(`New intel sources: ${totalSources}`);
  console.log(`New INSPIRED_BY:   ${totalEdges}`);
  console.log(`Total nodes now:   ${graph.stats.totalNodes}`);
  console.log(`Total edges now:   ${graph.stats.totalEdges}`);
  console.log(`\nWrote ${DATA_PATH}`);
}

main();
