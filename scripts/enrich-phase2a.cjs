#!/usr/bin/env node
/**
 * HEARTH Context Graph — Phase 2a Enrichment
 * Fetches MITRE ATT&CK STIX data and adds:
 *   - Threat Actor nodes (intrusion-set)
 *   - Campaign nodes (campaign)
 *   - EMPLOYS, ATTRIBUTED_TO, MOTIVATED_BY edges
 *   - Prevalence scores on technique nodes
 *
 * Merges results into public/context-graph-data.json
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'public', 'context-graph-data.json');
const ATTACK_URL = 'https://raw.githubusercontent.com/mitre/cti/master/enterprise-attack/enterprise-attack.json';

// ─── Fetch JSON from URL ───
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    console.log(`Fetching ATT&CK STIX bundle from:\n  ${url}`);
    console.log('  (this is ~30MB, may take a moment...)\n');

    const chunks = [];
    let totalBytes = 0;

    const request = (reqUrl) => {
      const mod = reqUrl.startsWith('https') ? https : require('http');
      mod.get(reqUrl, { headers: { 'User-Agent': 'HEARTH-Context-Graph/2.0' } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          request(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} fetching ATT&CK data`));
          return;
        }
        res.on('data', (chunk) => {
          chunks.push(chunk);
          totalBytes += chunk.length;
          if (totalBytes % (5 * 1024 * 1024) < chunk.length) {
            process.stdout.write(`  Downloaded ${(totalBytes / 1024 / 1024).toFixed(1)} MB...\r`);
          }
        });
        res.on('end', () => {
          console.log(`  Downloaded ${(totalBytes / 1024 / 1024).toFixed(1)} MB total`);
          try {
            const json = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
            resolve(json);
          } catch (e) {
            reject(new Error('Failed to parse ATT&CK JSON: ' + e.message));
          }
        });
        res.on('error', reject);
      }).on('error', reject);
    };

    request(url);
  });
}

// ─── Extract first sentence from description ───
function firstSentence(desc) {
  if (!desc) return '';
  // Match up to the first period followed by a space or end-of-string
  const m = desc.match(/^(.*?\.)\s/);
  if (m) return m[1].substring(0, 300);
  // No period found — take up to 300 chars
  return desc.substring(0, 300);
}

// ─── Normalize ATT&CK ID from STIX external references ───
function getAttackId(stixObj) {
  if (!stixObj.external_references) return null;
  const ref = stixObj.external_references.find(
    r => r.source_name === 'mitre-attack' && r.external_id
  );
  return ref ? ref.external_id : null;
}

// ─── Convert STIX attack-pattern ID (e.g. "T1059.001") to our node ID format ───
function normalizeAttackPatternId(stixObj) {
  const id = getAttackId(stixObj);
  if (!id) return null;
  // Our graph uses T1059.001 format (with dots)
  return id;
}

// ─── Main ───
async function main() {
  console.log('HEARTH Context Graph — Phase 2a Enrichment');
  console.log('============================================\n');

  // Load existing graph data
  if (!fs.existsSync(DATA_PATH)) {
    console.error('ERROR: context-graph-data.json not found. Run Phase 1 enrichment first.');
    process.exit(1);
  }

  const graphData = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  console.log(`Loaded existing graph: ${graphData.nodes.length} nodes, ${graphData.edges.length} edges\n`);

  // Build set of technique IDs already in our graph
  const existingTechIds = new Set();
  graphData.nodes.forEach(n => {
    if (n.type === 'technique') existingTechIds.add(n.id);
  });
  console.log(`Existing techniques in graph: ${existingTechIds.size}`);

  // Also build a set that includes base IDs for sub-technique matching
  // e.g. if we have T1059.001, also consider T1059 as "covered"
  const techBaseIds = new Set();
  existingTechIds.forEach(id => {
    techBaseIds.add(id);
    techBaseIds.add(id.split('.')[0]);
  });

  // Fetch ATT&CK STIX bundle
  const stix = await fetchJSON(ATTACK_URL);
  const objects = stix.objects || [];
  console.log(`STIX bundle: ${objects.length} objects\n`);

  // Index STIX objects by ID
  const stixById = {};
  objects.forEach(obj => { stixById[obj.id] = obj; });

  // ─── Build STIX attack-pattern ID → our technique ID mapping ───
  const stixIdToTechId = {};
  objects.forEach(obj => {
    if (obj.type === 'attack-pattern' && !obj.revoked && !obj.x_mitre_deprecated) {
      const attackId = normalizeAttackPatternId(obj);
      if (attackId && existingTechIds.has(attackId)) {
        stixIdToTechId[obj.id] = attackId;
      }
    }
  });
  console.log(`Matched ${Object.keys(stixIdToTechId).length} STIX attack-patterns to our techniques`);

  // ─── Extract relationships ───
  const relationships = objects.filter(obj =>
    obj.type === 'relationship' && !obj.revoked && !obj.x_mitre_deprecated
  );
  console.log(`Total STIX relationships: ${relationships.length}`);

  // actor (intrusion-set) → techniques they use
  const actorTechMap = {};   // stix actor id → Set of our technique IDs
  // campaign → techniques they use
  const campaignTechMap = {}; // stix campaign id → Set of our technique IDs
  // campaign → actor attribution
  const campaignActorMap = {}; // stix campaign id → Set of stix actor IDs

  relationships.forEach(rel => {
    const srcObj = stixById[rel.source_ref];
    const tgtObj = stixById[rel.target_ref];
    if (!srcObj || !tgtObj) return;

    if (rel.relationship_type === 'uses') {
      // intrusion-set uses attack-pattern
      if (srcObj.type === 'intrusion-set' && tgtObj.type === 'attack-pattern') {
        const techId = stixIdToTechId[rel.target_ref];
        if (techId) {
          if (!actorTechMap[rel.source_ref]) actorTechMap[rel.source_ref] = new Set();
          actorTechMap[rel.source_ref].add(techId);
        }
      }
      // campaign uses attack-pattern
      if (srcObj.type === 'campaign' && tgtObj.type === 'attack-pattern') {
        const techId = stixIdToTechId[rel.target_ref];
        if (techId) {
          if (!campaignTechMap[rel.source_ref]) campaignTechMap[rel.source_ref] = new Set();
          campaignTechMap[rel.source_ref].add(techId);
        }
      }
    }

    if (rel.relationship_type === 'attributed-to') {
      // campaign attributed-to intrusion-set
      if (srcObj.type === 'campaign' && tgtObj.type === 'intrusion-set') {
        if (!campaignActorMap[rel.source_ref]) campaignActorMap[rel.source_ref] = new Set();
        campaignActorMap[rel.source_ref].add(rel.target_ref);
      }
    }
  });

  // ─── Filter actors: only those connected to our techniques ───
  const relevantActorStixIds = new Set(Object.keys(actorTechMap));
  // Also include actors attributed to relevant campaigns
  Object.values(campaignActorMap).forEach(actorSet => {
    actorSet.forEach(aid => {
      if (stixById[aid] && stixById[aid].type === 'intrusion-set') {
        relevantActorStixIds.add(aid);
      }
    });
  });

  console.log(`\nRelevant threat actors (use our techniques): ${relevantActorStixIds.size}`);

  // ─── Filter campaigns: only those connected to our techniques ───
  const relevantCampaignStixIds = new Set(Object.keys(campaignTechMap));
  console.log(`Relevant campaigns (use our techniques): ${relevantCampaignStixIds.size}`);

  // ─── Build new nodes ───
  const newNodes = [];
  const newEdges = [];
  const existingNodeIds = new Set(graphData.nodes.map(n => n.id));

  // Threat Actor nodes
  const actorNodes = [];
  relevantActorStixIds.forEach(stixId => {
    const obj = stixById[stixId];
    if (!obj || obj.revoked || obj.x_mitre_deprecated) return;

    const attackId = getAttackId(obj);
    const nodeId = `actor:${attackId || obj.name.replace(/\s+/g, '_')}`;

    if (existingNodeIds.has(nodeId)) return;
    existingNodeIds.add(nodeId);

    const aliases = (obj.aliases || []).filter(a => a !== obj.name);
    const techsUsed = actorTechMap[stixId] ? [...actorTechMap[stixId]] : [];

    const node = {
      id: nodeId,
      type: 'threat_actor',
      label: obj.name,
      aliases: aliases.slice(0, 10),
      description: firstSentence(obj.description),
      technique_count: techsUsed.length,
      stix_id: stixId,
      external_references: (obj.external_references || [])
        .filter(r => r.url)
        .slice(0, 3)
        .map(r => ({ source: r.source_name, url: r.url }))
    };

    actorNodes.push(node);
    newNodes.push(node);

    // EMPLOYS edges: actor → technique
    techsUsed.forEach(techId => {
      newEdges.push({
        source: nodeId,
        target: techId,
        type: 'EMPLOYS'
      });
    });
  });

  console.log(`Created ${actorNodes.length} threat actor nodes`);

  // Campaign nodes
  const campaignNodes = [];
  relevantCampaignStixIds.forEach(stixId => {
    const obj = stixById[stixId];
    if (!obj || obj.revoked || obj.x_mitre_deprecated) return;

    const attackId = getAttackId(obj);
    const nodeId = `campaign:${attackId || obj.name.replace(/\s+/g, '_')}`;

    if (existingNodeIds.has(nodeId)) return;
    existingNodeIds.add(nodeId);

    const techsUsed = campaignTechMap[stixId] ? [...campaignTechMap[stixId]] : [];

    const node = {
      id: nodeId,
      type: 'campaign',
      label: obj.name,
      description: firstSentence(obj.description),
      first_seen: obj.first_seen || null,
      last_seen: obj.last_seen || null,
      technique_count: techsUsed.length,
      stix_id: stixId
    };

    campaignNodes.push(node);
    newNodes.push(node);

    // Campaign → technique edges (EMPLOYS)
    techsUsed.forEach(techId => {
      newEdges.push({
        source: nodeId,
        target: techId,
        type: 'EMPLOYS'
      });
    });

    // ATTRIBUTED_TO edges: campaign → actor
    const actors = campaignActorMap[stixId];
    if (actors) {
      actors.forEach(actorStixId => {
        const actorObj = stixById[actorStixId];
        if (!actorObj) return;
        const actorAttackId = getAttackId(actorObj);
        const actorNodeId = `actor:${actorAttackId || actorObj.name.replace(/\s+/g, '_')}`;
        if (existingNodeIds.has(actorNodeId)) {
          newEdges.push({
            source: nodeId,
            target: actorNodeId,
            type: 'ATTRIBUTED_TO'
          });
        }
      });
    }
  });

  console.log(`Created ${campaignNodes.length} campaign nodes`);

  // ─── MOTIVATED_BY edges: hypothesis → campaign ───
  // If a hypothesis targets a technique that a campaign also uses, create an inferred link
  const hypotheses = graphData.nodes.filter(n => n.type === 'hypothesis');
  const campaignTechSets = {};
  campaignNodes.forEach(cn => {
    const stixId = cn.stix_id;
    campaignTechSets[cn.id] = campaignTechMap[stixId] || new Set();
  });

  let motivatedByCount = 0;
  hypotheses.forEach(hyp => {
    const hypTechs = new Set(hyp.techniques || []);
    campaignNodes.forEach(cn => {
      const campTechs = campaignTechSets[cn.id];
      if (!campTechs || campTechs.size === 0) return;
      // Check overlap
      let hasOverlap = false;
      for (const t of hypTechs) {
        if (campTechs.has(t)) { hasOverlap = true; break; }
      }
      if (hasOverlap) {
        newEdges.push({
          source: hyp.id,
          target: cn.id,
          type: 'MOTIVATED_BY'
        });
        motivatedByCount++;
      }
    });
  });

  console.log(`Created ${motivatedByCount} MOTIVATED_BY edges (hypothesis → campaign)`);
  console.log(`Total new edges: ${newEdges.length}`);

  // ─── Prevalence scores for techniques ───
  // Score = actors using it + campaigns using it + recency bonus
  const now = Date.now();
  const techScores = {};

  // Count actors per technique
  Object.values(actorTechMap).forEach(techSet => {
    techSet.forEach(techId => {
      if (!techScores[techId]) techScores[techId] = { actors: 0, campaigns: 0, recencyBonus: 0 };
      techScores[techId].actors++;
    });
  });

  // Count campaigns per technique + recency bonus
  Object.entries(campaignTechMap).forEach(([stixId, techSet]) => {
    const campObj = stixById[stixId];
    let recency = 0;
    if (campObj && campObj.last_seen) {
      const lastSeen = new Date(campObj.last_seen).getTime();
      const ageMonths = (now - lastSeen) / (1000 * 60 * 60 * 24 * 30);
      // More recent campaigns get higher bonus (max 5 points for last 6 months)
      if (ageMonths < 6) recency = 5;
      else if (ageMonths < 12) recency = 3;
      else if (ageMonths < 24) recency = 2;
      else if (ageMonths < 48) recency = 1;
    }

    techSet.forEach(techId => {
      if (!techScores[techId]) techScores[techId] = { actors: 0, campaigns: 0, recencyBonus: 0 };
      techScores[techId].campaigns++;
      techScores[techId].recencyBonus = Math.max(techScores[techId].recencyBonus, recency);
    });
  });

  // Calculate raw scores and find max for normalization
  let maxRaw = 0;
  const rawScores = {};
  Object.entries(techScores).forEach(([techId, s]) => {
    const raw = s.actors + s.campaigns * 2 + s.recencyBonus;
    rawScores[techId] = raw;
    if (raw > maxRaw) maxRaw = raw;
  });

  // Normalize to 0-1 and apply to technique nodes
  let hottestTech = null;
  let hottestScore = 0;

  graphData.nodes.forEach(node => {
    if (node.type === 'technique') {
      const raw = rawScores[node.id] || 0;
      const score = maxRaw > 0 ? parseFloat((raw / maxRaw).toFixed(3)) : 0;
      node.prevalence_score = score;
      node.actor_count = techScores[node.id] ? techScores[node.id].actors : 0;
      node.campaign_count = techScores[node.id] ? techScores[node.id].campaigns : 0;

      if (score > hottestScore) {
        hottestScore = score;
        hottestTech = node.id;
      }
    }
  });

  const scoredCount = Object.keys(techScores).length;
  console.log(`\nPrevalence scores assigned to ${scoredCount} techniques`);
  console.log(`Hottest technique: ${hottestTech} (score: ${hottestScore})`);

  // ─── Merge into graph data ───
  graphData.nodes.push(...newNodes);
  graphData.edges.push(...newEdges);

  // Update stats
  graphData.stats.totalNodes = graphData.nodes.length;
  graphData.stats.totalEdges = graphData.edges.length;
  graphData.stats.threat_actors = actorNodes.length;
  graphData.stats.campaigns = campaignNodes.length;
  graphData.stats.hottest_technique = hottestTech;
  graphData.stats.hottest_technique_score = hottestScore;

  // Update timestamp
  graphData.generated_at = new Date().toISOString();
  graphData.phase2a_enriched_at = new Date().toISOString();

  // Write output
  fs.writeFileSync(DATA_PATH, JSON.stringify(graphData, null, 2));

  console.log(`\n✓ Output written to: public/context-graph-data.json`);
  console.log(`  Total nodes: ${graphData.stats.totalNodes}`);
  console.log(`  Total edges: ${graphData.stats.totalEdges}`);
  console.log(`  Threat actors: ${actorNodes.length}`);
  console.log(`  Campaigns: ${campaignNodes.length}`);
  console.log(`  New edges: ${newEdges.length}`);
  console.log(`\nPhase 2a enrichment complete.`);
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
