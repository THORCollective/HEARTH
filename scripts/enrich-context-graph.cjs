#!/usr/bin/env node
/**
 * HEARTH Context Graph Enrichment Script
 * Reads hypothesis markdown files + git history to produce context-graph-data.json
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIRS = {
  Flames: 'f',
  Embers: 'e',
  Alchemy: 'a'
};

// ─── MITRE Tactic Mapping (technique prefix → tactic) ───
const TECHNIQUE_TO_TACTICS = {};

const TACTIC_MAP = {
  'Reconnaissance': ['T1595','T1592','T1589','T1590','T1591','T1597','T1596','T1598'],
  'Resource Development': ['T1583','T1584','T1585','T1586','T1587','T1588','T1608'],
  'Initial Access': ['T1189','T1190','T1133','T1200','T1566','T1091','T1195','T1199','T1078'],
  'Execution': ['T1059','T1203','T1047','T1053','T1129','T1569','T1204'],
  'Persistence': ['T1053','T1547','T1037','T1542','T1543','T1546'],
  'Privilege Escalation': ['T1548','T1134','T1547','T1484','T1546','T1055','T1053'],
  'Defense Evasion': ['T1548','T1134','T1197','T1140','T1006','T1480','T1211','T1222','T1564','T1574','T1036','T1112','T1027','T1014','T1218','T1216','T1220','T1497','T1535','T1553','T1221','T1205'],
  'Credential Access': ['T1557','T1110','T1555','T1212','T1187','T1606','T1056','T1556','T1111','T1621','T1040','T1003','T1528','T1558','T1539','T1552','T1201'],
  'Discovery': ['T1087','T1010','T1217','T1580','T1538','T1526','T1619','T1613','T1622','T1482','T1083','T1615','T1654','T1046','T1135','T1040','T1120','T1069','T1057','T1012','T1018','T1518','T1082','T1614','T1016','T1049','T1033','T1007','T1124','T1497'],
  'Lateral Movement': ['T1021','T1534','T1570','T1563','T1091','T1080'],
  'Collection': ['T1560','T1123','T1119','T1115','T1530','T1602','T1213','T1005','T1039','T1025','T1074','T1114','T1113','T1125'],
  'Command and Control': ['T1071','T1132','T1001','T1568','T1573','T1008','T1104','T1095','T1571','T1572','T1090','T1219','T1102'],
  'Exfiltration': ['T1020','T1030','T1048','T1041','T1011','T1052','T1567','T1029','T1537'],
  'Impact': ['T1531','T1485','T1486','T1565','T1491','T1561','T1499','T1495','T1490','T1489','T1529']
};

// Build reverse mapping: technique base ID → [tactics]
for (const [tactic, techniques] of Object.entries(TACTIC_MAP)) {
  for (const tech of techniques) {
    if (!TECHNIQUE_TO_TACTICS[tech]) TECHNIQUE_TO_TACTICS[tech] = [];
    if (!TECHNIQUE_TO_TACTICS[tech].includes(tactic)) {
      TECHNIQUE_TO_TACTICS[tech].push(tactic);
    }
  }
}

// ─── Parse a hypothesis markdown file ───
function parseHypothesisFile(filePath, category, subtype) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const fileName = path.basename(filePath, '.md');

  // Get the title from line 1-2 (# ID followed by description, or inline)
  let title = '';
  let id = fileName;

  // Find the markdown table row (skip header + separator)
  const tableRows = lines.filter(l => l.startsWith('|') && !l.match(/^\|\s*-+/));
  // First row is header, second is data
  const dataRow = tableRows.length >= 2 ? tableRows[1] : null;

  if (dataRow) {
    const cells = dataRow.split('|').map(c => c.trim()).filter(Boolean);
    // Columns: Hunt #, Idea/Hypothesis, Tactic, Notes, Tags, Submitter
    if (cells.length >= 2) {
      id = cells[0].trim();
      title = cells[1].trim();
    }

    const tacticStr = cells.length >= 3 ? cells[2].trim() : '';
    const tactics = tacticStr.split(',').map(t => t.trim()).filter(Boolean);

    const tagsStr = cells.length >= 5 ? cells[4].trim() : '';
    const submitterStr = cells.length >= 6 ? cells[5].trim() : '';

    // Extract submitter name from markdown link or plain text
    let submitter = submitterStr;
    const linkMatch = submitterStr.match(/\[([^\]]+)\]/);
    if (linkMatch) submitter = linkMatch[1];

    // Extract technique IDs from tags
    // Tags look like: #T1110 #T1059_001 #T1071_004
    const techniques = [];
    const tagMatches = tagsStr.match(/#(T\d{4}(?:[._]\d{3})?)/g) || [];
    tagMatches.forEach(t => {
      // Normalize: #T1059_001 → T1059.001
      const techId = t.replace('#', '').replace(/_/g, '.');
      techniques.push(techId);
    });

    // Also check for T0xxx ICS techniques
    const icsMatches = tagsStr.match(/#(T0\d{3}(?:[._]\d{3})?)/g) || [];
    icsMatches.forEach(t => {
      const techId = t.replace('#', '').replace(/_/g, '.');
      if (!techniques.includes(techId)) techniques.push(techId);
    });

    // Extract clean tags (non-technique tags)
    const tags = (tagsStr.match(/#[\w_-]+/g) || [])
      .map(t => t.replace('#', ''))
      .filter(t => !t.match(/^T\d{4}/));

    // Extract data sources from the existing hunts-data.json if available, or leave empty
    // (Data sources aren't reliably in the markdown tables)

    return {
      id,
      title: title.substring(0, 200),
      category,
      subtype,
      tactics,
      techniques,
      tags,
      submitter,
      filePath: path.relative(ROOT, filePath)
    };
  }

  // Fallback: minimal parse from title line
  const titleLine = lines.find(l => l.startsWith('# '));
  if (titleLine) id = titleLine.replace('# ', '').trim();
  const descLine = lines[1] && !lines[1].startsWith('|') ? lines[1].trim() : '';

  return {
    id,
    title: descLine || id,
    category,
    subtype,
    tactics: [],
    techniques: [],
    tags: [],
    submitter: '',
    filePath: path.relative(ROOT, filePath)
  };
}

// ─── Get git dates and contributors ───
function getGitCreatedDate(filePath) {
  try {
    const result = execSync(
      `git log --follow --diff-filter=A --format=%aI -- "${filePath}"`,
      { cwd: ROOT, encoding: 'utf-8', timeout: 10000 }
    ).trim();
    const lines = result.split('\n').filter(Boolean);
    return lines.length > 0 ? lines[lines.length - 1] : null;
  } catch { return null; }
}

function getGitUpdatedDate(filePath) {
  try {
    const result = execSync(
      `git log -1 --format=%aI -- "${filePath}"`,
      { cwd: ROOT, encoding: 'utf-8', timeout: 10000 }
    ).trim();
    return result || null;
  } catch { return null; }
}

function getGitAuthors(filePath) {
  try {
    const result = execSync(
      `git log --format="%aN <%aE>" -- "${filePath}"`,
      { cwd: ROOT, encoding: 'utf-8', timeout: 10000 }
    ).trim();
    return result.split('\n').filter(Boolean);
  } catch { return []; }
}

// ─── Resolve tactics for a technique ID ───
function getTacticsForTechnique(techId) {
  // Try exact match first (e.g., T1059)
  const baseId = techId.split('.')[0];
  const tactics = TECHNIQUE_TO_TACTICS[baseId] || [];
  return [...new Set(tactics)];
}

// ─── Enrich data source info from existing hunts-data.json ───
function loadExistingDataSources() {
  const jsonPath = path.join(ROOT, 'public', 'hunts-data.json');
  if (!fs.existsSync(jsonPath)) return {};
  try {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const map = {};
    data.forEach(h => {
      if (h.id) map[h.id] = h;
    });
    return map;
  } catch { return {}; }
}

// ─── Main ───
function main() {
  console.log('HEARTH Context Graph Enrichment');
  console.log('================================\n');

  const existingData = loadExistingDataSources();
  const hypotheses = [];
  const contributorMap = {};   // name → { count, emails }
  const techniqueSet = new Set();
  const tacticSet = new Set();
  const dataSourceSet = new Set();

  // Parse all hypothesis files
  for (const [dir, subtype] of Object.entries(DIRS)) {
    const dirPath = path.join(ROOT, dir);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath)
      .filter(f => f.endsWith('.md'))
      .sort();

    console.log(`Parsing ${dir}/: ${files.length} files`);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const hyp = parseHypothesisFile(filePath, dir, subtype);

      // Enrich with git dates
      hyp.created_at = getGitCreatedDate(hyp.filePath);
      hyp.updated_at = getGitUpdatedDate(hyp.filePath);

      // Get git authors for this file
      const authors = getGitAuthors(hyp.filePath);
      hyp.contributors = [...new Set(authors)];

      // Track contributors
      for (const author of authors) {
        const nameMatch = author.match(/^(.+?)\s*<(.+?)>$/);
        const name = nameMatch ? nameMatch[1] : author;
        const email = nameMatch ? nameMatch[2] : '';
        if (!contributorMap[name]) {
          contributorMap[name] = { count: 0, emails: new Set(), hypotheses: new Set() };
        }
        contributorMap[name].count++;
        if (email) contributorMap[name].emails.add(email);
        contributorMap[name].hypotheses.add(hyp.id);
      }

      // Enrich with data sources from hunts-data.json if available
      const existing = existingData[hyp.id];
      if (existing && existing.tags) {
        // The existing data already has parsed data in graph.html's RAW
        // But data sources are available in hunts-data.json as part of each entry
      }

      // Track techniques
      hyp.techniques.forEach(t => techniqueSet.add(t));

      hypotheses.push(hyp);
    }
  }

  console.log(`\nTotal hypotheses parsed: ${hypotheses.length}`);

  // ─── Build data source mapping from existing graph data ───
  // Read data sources from the RAW data embedded in graph.html
  const graphHtml = fs.readFileSync(path.join(ROOT, 'public', 'graph.html'), 'utf-8');
  const rawMatch = graphHtml.match(/const RAW = ({[\s\S]*?});/);
  let rawData = null;
  if (rawMatch) {
    try { rawData = JSON.parse(rawMatch[1]); } catch {}
  }

  // Map hypothesis IDs to data sources from the existing graph
  const dsMap = {};
  if (rawData && rawData.h) {
    rawData.h.forEach(h => {
      dsMap[h.i] = h.d || [];
    });
  }

  // Enrich hypotheses with data sources
  hypotheses.forEach(hyp => {
    hyp.dataSources = dsMap[hyp.id] || [];
    hyp.dataSources.forEach(ds => dataSourceSet.add(ds));
  });

  // ─── Build technique → tactic mapping ───
  const techniqueTactics = {};
  for (const techId of techniqueSet) {
    const tactics = getTacticsForTechnique(techId);
    techniqueTactics[techId] = tactics;
    tactics.forEach(t => tacticSet.add(t));
  }

  // ─── Build graph nodes ───
  const nodes = [];
  const edges = [];

  // 1. Hypothesis nodes
  hypotheses.forEach(hyp => {
    nodes.push({
      id: hyp.id,
      type: 'hypothesis',
      subtype: hyp.subtype,
      label: hyp.id,
      title: hyp.title,
      category: hyp.category,
      tactics: hyp.tactics,
      techniques: hyp.techniques,
      dataSources: hyp.dataSources,
      tags: hyp.tags,
      submitter: hyp.submitter,
      created_at: hyp.created_at,
      updated_at: hyp.updated_at,
      contributors: hyp.contributors,
      filePath: hyp.filePath
    });
  });

  // 2. Technique nodes
  for (const techId of techniqueSet) {
    nodes.push({
      id: techId,
      type: 'technique',
      label: techId,
      tactics: techniqueTactics[techId] || []
    });
  }

  // 3. Data source nodes
  for (const ds of dataSourceSet) {
    nodes.push({
      id: `ds:${ds}`,
      type: 'datasource',
      label: ds
    });
  }

  // 4. MitreTactic nodes (14 official tactics)
  const tacticOrder = [
    'Reconnaissance', 'Resource Development', 'Initial Access', 'Execution',
    'Persistence', 'Privilege Escalation', 'Defense Evasion', 'Credential Access',
    'Discovery', 'Lateral Movement', 'Collection', 'Command and Control',
    'Exfiltration', 'Impact'
  ];

  // Only create tactic nodes for tactics that appear in our data
  const activeTactics = new Set();
  for (const techId of techniqueSet) {
    const tactics = techniqueTactics[techId] || [];
    tactics.forEach(t => activeTactics.add(t));
  }
  // Also include tactics directly from hypothesis tactic fields
  hypotheses.forEach(h => h.tactics.forEach(t => activeTactics.add(t)));

  for (const tactic of tacticOrder) {
    if (activeTactics.has(tactic)) {
      const techCount = [...techniqueSet].filter(t =>
        (techniqueTactics[t] || []).includes(tactic)
      ).length;

      nodes.push({
        id: `tactic:${tactic}`,
        type: 'tactic',
        label: tactic,
        techniqueCount: techCount
      });
    }
  }

  // 5. Contributor nodes
  const contributors = [];
  for (const [name, data] of Object.entries(contributorMap)) {
    const contribId = `contrib:${name}`;
    contributors.push({
      id: contribId,
      type: 'contributor',
      label: name,
      contributionCount: data.count,
      hypothesisCount: data.hypotheses.size,
      hypotheses: [...data.hypotheses]
    });
  }
  nodes.push(...contributors);

  // ─── Build edges ───

  // TARGETS: Hypothesis → Technique
  hypotheses.forEach(hyp => {
    hyp.techniques.forEach(techId => {
      edges.push({
        source: hyp.id,
        target: techId,
        type: 'TARGETS'
      });
    });
  });

  // REQUIRES: Hypothesis → DataSource
  hypotheses.forEach(hyp => {
    hyp.dataSources.forEach(ds => {
      edges.push({
        source: hyp.id,
        target: `ds:${ds}`,
        type: 'REQUIRES'
      });
    });
  });

  // OBSERVES: DataSource → Technique (via hypothesis linkage)
  const dsToTechs = {};
  hypotheses.forEach(hyp => {
    hyp.dataSources.forEach(ds => {
      if (!dsToTechs[ds]) dsToTechs[ds] = new Set();
      hyp.techniques.forEach(t => dsToTechs[ds].add(t));
    });
  });
  for (const [ds, techs] of Object.entries(dsToTechs)) {
    for (const techId of techs) {
      edges.push({
        source: `ds:${ds}`,
        target: techId,
        type: 'OBSERVES'
      });
    }
  }

  // BELONGS_TO: Technique → MitreTactic
  for (const techId of techniqueSet) {
    const tactics = techniqueTactics[techId] || [];
    tactics.forEach(tactic => {
      if (activeTactics.has(tactic)) {
        edges.push({
          source: techId,
          target: `tactic:${tactic}`,
          type: 'BELONGS_TO'
        });
      }
    });
  }

  // AUTHORED_BY: Hypothesis → Contributor
  hypotheses.forEach(hyp => {
    const seen = new Set();
    (hyp.contributors || []).forEach(author => {
      const nameMatch = author.match(/^(.+?)\s*<(.+?)>$/);
      const name = nameMatch ? nameMatch[1] : author;
      if (seen.has(name)) return;
      seen.add(name);
      edges.push({
        source: hyp.id,
        target: `contrib:${name}`,
        type: 'AUTHORED_BY',
        timestamp: hyp.created_at
      });
    });
  });

  // ─── Compute stats ───
  const dates = hypotheses
    .map(h => h.created_at)
    .filter(Boolean)
    .map(d => new Date(d))
    .sort((a, b) => a - b);

  const now = new Date();
  const avgAgeMs = dates.length > 0
    ? dates.reduce((sum, d) => sum + (now - d), 0) / dates.length
    : 0;
  const avgAgeDays = Math.round(avgAgeMs / (1000 * 60 * 60 * 24));

  const tacticNodeCount = nodes.filter(n => n.type === 'tactic').length;
  const stats = {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    hypotheses: hypotheses.length,
    techniques: techniqueSet.size,
    dataSources: dataSourceSet.size,
    tactics: tacticNodeCount,
    contributors: Object.keys(contributorMap).length,
    dateRange: dates.length > 0
      ? { oldest: dates[0].toISOString(), newest: dates[dates.length - 1].toISOString() }
      : null,
    averageHypothesisAgeDays: avgAgeDays
  };

  // ─── Output ───
  const output = {
    generated_at: new Date().toISOString(),
    stats,
    nodes,
    edges
  };

  const outPath = path.join(ROOT, 'public', 'context-graph-data.json');
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`\n✓ Output written to: ${path.relative(ROOT, outPath)}`);
  console.log(`  Nodes: ${stats.totalNodes} (${stats.hypotheses} hypotheses, ${stats.techniques} techniques, ${stats.dataSources} data sources, ${stats.tactics} tactics, ${stats.contributors} contributors)`);
  console.log(`  Edges: ${stats.totalEdges}`);
  console.log(`  Date range: ${stats.dateRange ? stats.dateRange.oldest.split('T')[0] + ' → ' + stats.dateRange.newest.split('T')[0] : 'N/A'}`);
  console.log(`  Average hypothesis age: ${avgAgeDays} days`);
}

main();
