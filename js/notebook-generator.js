/**
 * NotebookGenerator Module
 *
 * Handles Jupyter notebook generation for threat hunting activities using the PEAK framework.
 * This module is responsible for creating structured notebooks with hunt data, analysis templates,
 * and visualization code.
 *
 * @module NotebookGenerator
 */

/**
 * NotebookGenerator class for creating PEAK framework-based Jupyter notebooks
 *
 * The NotebookGenerator creates comprehensive threat hunting notebooks that follow
 * the PEAK framework (Prepare, Execute, Act with Knowledge). Each notebook includes:
 * - Hunt hypothesis and metadata
 * - Data analysis setup and helper functions
 * - Query templates and refinement sections
 * - Visualization and analytics code
 * - Findings documentation and reporting templates
 *
 * @class
 */
export class NotebookGenerator {
  /**
   * Creates a new NotebookGenerator instance
   */
  constructor() {
    this.numberFormatter = new Intl.NumberFormat('en-US');
  }

  /**
   * Generate a complete Jupyter notebook for a hunt
   *
   * @param {Object} huntData - The hunt data object
   * @param {string} huntData.id - Hunt identifier
   * @param {string} huntData.title - Hunt title
   * @param {string} huntData.category - Hunt category (Flames, Embers, Sparks)
   * @param {string} huntData.hypothesis - Hunt hypothesis
   * @param {string} huntData.tactic - MITRE ATT&CK tactics
   * @param {Array<string>} huntData.tags - Hunt tags
   * @param {string} huntData.references - Hunt references
   * @param {string} huntData.why - Hunt rationale
   * @param {string} huntData.submitter - Submitter name
   * @param {string} huntData.file_path - Path to hunt source file
   * @returns {Promise<string>} JSON string of the Jupyter notebook
   */
  async generateNotebookContent(huntData) {
    const timestamp = new Date().toISOString();
    const huntTitle = huntData.title || 'Threat Hunting Notebook';

    // Create Jupyter notebook structure
    const notebook = {
      cells: [
        this._createHeaderCell(huntData, timestamp, huntTitle),
        this._createPrepareCell(huntData),
        this._createSetupCell(huntData, huntTitle),
        this._createExecuteHeaderCell(),
        this._createInitialQueryCell(),
        this._createQueryNotesCell(),
        this._createRefinedQueryCell(),
        this._createVisualizationCell(),
        this._createDetectionLogicCell(),
        this._createActCell(huntData),
        this._createActCodeCell(),
        this._createKnowledgeCell(huntData),
        this._createConclusionCell()
      ],
      metadata: {
        kernelspec: {
          display_name: 'Python 3',
          language: 'python',
          name: 'python3'
        },
        language_info: {
          codemirror_mode: {
            name: 'ipython',
            version: 3
          },
          file_extension: '.py',
          mimetype: 'text/x-python',
          name: 'python',
          nbconvert_exporter: 'python',
          pygments_lexer: 'ipython3',
          version: '3.8.5'
        }
      },
      nbformat: 4,
      nbformat_minor: 4
    };

    return JSON.stringify(notebook, null, 2);
  }

  /**
   * Create the header markdown cell for the notebook
   * @private
   */
  _createHeaderCell(huntData, timestamp, huntTitle) {
    return {
      cell_type: 'markdown',
      metadata: {},
      source: [
        '*This notebook provides a structured and consistent way to document threat hunting activities using the PEAK Framework (Prepare, Execute, Act with Knowledge). It guides threat hunters through defining clear hypotheses, scoping the hunt precisely using the ABLE methodology, executing targeted queries, and documenting findings to ensure thorough and actionable results.*\n',
        '\n',
        `**Generated:** ${timestamp}  \n`,
        '**Source:** THOR Collective HEARTH Database  \n',
        '**Database:** https://hearth.thorcollective.com  \n',
        '**Framework:** PEAK (Prepare, Execute, Act with Knowledge)  \n',
        '**Template:** https://dispatch.thorcollective.com/p/the-peak-threat-hunting-template\n',
        '\n',
        '---\n',
        '\n',
        '# Threat Hunting Report - PEAK Framework\n',
        '\n',
        `## Hunt ID: ${huntData.id}\n`,
        `*(${huntData.category} - ${huntData.category === 'Flames' ? 'Hypothesis-driven' : huntData.category === 'Embers' ? 'Baseline' : 'Model-Assisted'})*\n`,
        '\n',
        `## Hunt Title: ${huntTitle}`
      ]
    };
  }

  /**
   * Create the PREPARE phase markdown cell
   * @private
   */
  _createPrepareCell(huntData) {
    return {
      cell_type: 'markdown',
      metadata: {},
      source: [
        '---\n',
        '\n',
        '## PREPARE: Define the Hunt\n',
        '\n',
        '| **Hunt Information**            | **Details** |\n',
        '|----------------------------------|-------------|\n',
        `| **Hypothesis**                  | ${huntData.hypothesis} |\n`,
        '| **Threat Hunter Name**          | [Your Name] |\n',
        `| **Date**                        | ${new Date().toLocaleDateString()} |\n`,
        '| **Requestor**                   | [Requestor Name] |\n',
        '| **Timeframe for hunt**          | [Expected Duration] |\n',
        '\n',
        '## Scoping with the ABLE Methodology\n',
        '\n',
        '*Clearly define your hunt scope using the ABLE framework. Replace all placeholders with relevant details for your scenario.*\n',
        '\n',
        '| **Field**   | **Description**                                                                                                                                                                                                                                                                             | **Your Input**                   |\n',
        '|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------|\n',
        '| **Actor**   | *(Optional)* Identify the threat actor involved with the behavior, if applicable. This step is optional because hunts aren\'t always tied to a specific actor. You may be investigating techniques used across multiple adversaries or looking for suspicious activity regardless of attribution. Focus on the what and how before the who, unless actor context adds meaningful value to the hunt.  | `[Threat Actor or N/A]`          |\n',
        '| **Behavior**| Describe the actions observed or expected, including tactics, techniques, and procedures (TTPs). Specify methods or tools involved.                                                                                                                                                 | `[Describe observed or expected behavior]` |\n',
        '| **Location**| Specify where the activity occurred, such as an endpoint, network segment, or cloud environment.                                                                                                                                 | `[Location]`            |\n',
        '| **Evidence**| Clearly list logs, artifacts, or telemetry supporting your hypothesis. For each source, provide critical fields required to validate the behavior, and include specific examples of observed or known malicious activity to illustrate expected findings. | `- Source: [Log Source]`<br>`- Key Fields: [Critical Fields]`<br>`- Example: [Expected Example of Malicious Activity]`<br><br>`- Source: [Additional Source]`<br>`- Key Fields: [Critical Fields]`<br>`- Example: [Expected Example of Malicious Activity]` |\n',
        '\n',
        '## Related Tickets (detection coverage, previous incidents, etc.)\n',
        '\n',
        '| **Role**                        | **Ticket and Other Details** |\n',
        '|----------------------------------|------------------------------|\n',
        '| **SOC/IR**                      | [Insert related ticket or incident details] |\n',
        '| **Threat Intel (TI)**            | [Insert related ticket] |\n',
        '| **Detection Engineering (DE)**   | [Insert related ticket] |\n',
        '| **Red Team / Pen Testing**       | [Insert related ticket] |\n',
        '| **Other**                        | [Insert related ticket] |\n',
        '\n',
        '## **Threat Intel & Research**\n',
        '- **MITRE ATT&CK Techniques:**\n',
        `  - \`${huntData.tactic || 'TAxxxx - Tactic Name'}\`\n`,
        '  - `Txxxx - Technique Name`\n',
        '- **Related Reports, Blogs, or Threat Intel Sources:**\n',
        `  - ${huntData.references || '[Link to references]'}\n`,
        '- **Historical Prevalence & Relevance:**\n',
        `  - ${huntData.why || '*(Has this been observed before in your environment? Are there any detections/mitigations for this activity already in place?)*'}\n`,
        '\n',
        '---'
      ]
    };
  }

  /**
   * Create the setup code cell with helper functions
   * @private
   */
  _createSetupCell(huntData, huntTitle) {
    return {
      cell_type: 'code',
      execution_count: null,
      metadata: {},
      outputs: [],
      source: [
        '# Threat Hunting Environment Setup\n',
        'import pandas as pd\n',
        'import numpy as np\n',
        'import matplotlib.pyplot as plt\n',
        'import seaborn as sns\n',
        'from datetime import datetime, timedelta\n',
        'import json\n',
        'import warnings\n',
        'warnings.filterwarnings(\'ignore\')\n',
        '\n',
        '# Configure plotting style\n',
        'plt.style.use(\'default\')\n',
        'sns.set_palette("husl")\n',
        'plt.rcParams[\'figure.figsize\'] = (12, 8)\n',
        '\n',
        '# Hunt tracking variables\n',
        `hunt_id = "${huntData.id}"\n`,
        `hunt_title = "${huntTitle}"\n`,
        `hunt_hypothesis = "${huntData.hypothesis}"\n`,
        'hunt_start_time = datetime.now()\n',
        '\n',
        '# Helper functions for hunt analysis\n',
        'def log_hunt_step(step_name, details=""):\n',
        '    """Log hunt steps for documentation."""\n',
        '    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")\n',
        '    print(f"[{timestamp}] {step_name}: {details}")\n',
        '\n',
        'def analyze_results(data, description=""):\n',
        '    """Analyze and summarize hunt results."""\n',
        '    if isinstance(data, pd.DataFrame):\n',
        '        print(f"Analysis: {description}")\n',
        '        print(f"Total Records: {len(data):,}")\n',
        '        print(f"Columns: {list(data.columns)}")\n',
        '        print(f"Date Range: {data.index.min() if hasattr(data.index, \'min\') else \'N/A\'} to {data.index.max() if hasattr(data.index, \'max\') else \'N/A\'}")\n',
        '        print("-" * 50)\n',
        '    else:\n',
        '        print(f"Analysis: {description} - {len(data) if hasattr(data, \'__len__\') else \'N/A\'} items")\n',
        '\n',
        'print("🔥 THOR Collective HEARTH - Threat Hunting Environment Initialized")\n',
        'print(f"Hunt ID: {hunt_id}")\n',
        'print(f"Hunt Title: {hunt_title}")\n',
        'print(f"Started: {hunt_start_time}")\n',
        'print("-" * 60)'
      ]
    };
  }

  /**
   * Create the EXECUTE phase header cell
   * @private
   */
  _createExecuteHeaderCell() {
    return {
      cell_type: 'markdown',
      metadata: {},
      source: [
        '## EXECUTE: Run the Hunt\n',
        '\n',
        '### Hunting Queries\n',
        '*(Document queries for Splunk, Sigma, KQL, or another query language to execute the hunt. Capture any adjustments made during analysis and iterate on findings.)*\n',
        '\n',
        '#### Initial Query'
      ]
    };
  }

  /**
   * Create the initial query code cell
   * @private
   */
  _createInitialQueryCell() {
    return {
      cell_type: 'code',
      execution_count: null,
      metadata: {},
      outputs: [],
      source: [
        '# Initial Hunt Query\n',
        '# Replace this with your actual query for your SIEM/logging platform\n',
        '\n',
        '# Example Splunk query:\n',
        '# index=main sourcetype=windows:security EventCode=4688\n',
        '# | search CommandLine="*suspicious_pattern*"\n',
        '# | stats count by host, user, CommandLine\n',
        '\n',
        '# Example KQL query:\n',
        '# SecurityEvent\n',
        '# | where EventID == 4688\n',
        '# | where CommandLine contains "suspicious_pattern"\n',
        '# | summarize count() by Computer, Account, CommandLine\n',
        '\n',
        '# For demonstration, we\'ll simulate some data\n',
        'log_hunt_step("Initial Query Execution", "Running initial hunt query")\n',
        '\n',
        '# Simulate initial query results\n',
        'initial_results = pd.DataFrame({\n',
        '    \'timestamp\': pd.date_range(start=\'2024-01-01\', periods=100, freq=\'H\'),\n',
        '    \'host\': np.random.choice([\'srv-01\', \'srv-02\', \'ws-001\', \'ws-002\'], 100),\n',
        '    \'user\': np.random.choice([\'admin\', \'user1\', \'service_account\'], 100),\n',
        '    \'event_type\': np.random.choice([\'process_creation\', \'network_connection\', \'file_access\'], 100),\n',
        '    \'suspicious_score\': np.random.uniform(0, 1, 100)\n',
        '})\n',
        '\n',
        'analyze_results(initial_results, "Initial hunt query results")\n',
        'print(f"\\nTop 10 results:")\n',
        'print(initial_results.head(10))'
      ]
    };
  }

  /**
   * Create the query notes markdown cell
   * @private
   */
  _createQueryNotesCell() {
    return {
      cell_type: 'markdown',
      metadata: {},
      source: [
        '**Notes:**\n',
        '- Did this query return expected results?\n',
        '- Were there false positives or gaps?\n',
        '- How did you refine the query based on findings?\n',
        '\n',
        '#### Refined Query (if applicable)'
      ]
    };
  }

  /**
   * Create the refined query code cell
   * @private
   */
  _createRefinedQueryCell() {
    return {
      cell_type: 'code',
      execution_count: null,
      metadata: {},
      outputs: [],
      source: [
        '# Refined Hunt Query\n',
        'log_hunt_step("Refined Query Execution", "Running refined hunt query based on initial findings")\n',
        '\n',
        '# Apply refinements based on initial query results\n',
        '# Example refinements:\n',
        '# - Add time-based filtering\n',
        '# - Exclude known false positives\n',
        '# - Add additional correlation criteria\n',
        '\n',
        'refined_results = initial_results[\n',
        '    (initial_results[\'suspicious_score\'] > 0.7) &  # Higher threshold\n',
        '    (initial_results[\'event_type\'] == \'process_creation\')  # Focus on process creation\n',
        '].copy()\n',
        '\n',
        'analyze_results(refined_results, "Refined hunt query results")\n',
        '\n',
        'print("\\nRationale for Refinement:")\n',
        'print("- Applied suspicious score threshold > 0.7 to reduce false positives")\n',
        'print("- Focused on process creation events for better signal-to-noise ratio")\n',
        'print("- Excluded service account activities to focus on user-driven activity")'
      ]
    };
  }

  /**
   * Create the visualization section
   * @private
   */
  _createVisualizationCell() {
    return {
      cell_type: 'markdown',
      metadata: {},
      source: [
        '### Visualization or Analytics\n',
        '*(Describe any dashboards, anomaly detection methods, or visualizations used. Capture observations and note whether visualizations revealed additional insights. **Add screenshots!**)*'
      ]
    };
  }

  /**
   * Create the detection logic markdown cell
   * @private
   */
  _createDetectionLogicCell() {
    return {
      cell_type: 'markdown',
      metadata: {},
      source: [
        '### Detection Logic\n',
        '*(How would this be turned into a detection rule? Thresholds, tuning considerations, etc.)*\n',
        '\n',
        '- **Initial Detection Criteria:**\n',
        '  - What conditions would trigger an alert?\n',
        '  - Are there threshold values that indicate malicious activity?\n',
        '\n',
        '- **Refinements After Review:**\n',
        '  - Did certain legitimate activities cause false positives?\n',
        '  - How can you tune the rule to focus on real threats?\n',
        '\n',
        '### Capturing Your Analysis & Iteration\n',
        '- **Summarize insights gained from each query modification and visualization.**\n',
        '- **Reiterate key findings:**\n',
        '  - Did this query lead to any findings, false positives, or hypotheses for further hunting?\n',
        '  - If this hunt were repeated, what changes should be made?\n',
        '  - Does this hunt generate ideas for additional hunts?\n',
        '\n',
        '- **Document the next steps for refining queries for detections and other outputs.**\n',
        '\n',
        '---'
      ]
    };
  }

  /**
   * Create the ACT phase markdown cell
   * @private
   */
  _createActCell(huntData) {
    return {
      cell_type: 'markdown',
      metadata: {},
      source: [
        '## ACT: Findings & Response\n',
        '\n',
        '### Hunt Review Template\n',
        '\n',
        '### **Hypothesis / Topic**\n',
        `*(Restate the hypothesis and topic of the investigation: ${huntData.hypothesis})*\n`,
        '\n',
        '### **Executive Summary**\n',
        '**Key Points:**\n',
        '- 3-5 sentences summarizing the investigation.\n',
        '- Indicate whether the hypothesis was proved or disproved.\n',
        '- Summarize the main findings (e.g., "We found..., we did not find..., we did not find... but we did find...").\n',
        '\n',
        '### **Findings**\n',
        '*(Summarize key results, including any unusual activity.)*\n',
        '\n',
        '| **Finding** | **Ticket Number and Link** | **Description** |\n',
        '|------------|----------------------------|------------------|\n',
        '| [Describe finding] | [Insert Ticket Number] | [Brief description of the finding, such as suspicious activity, new detection idea, data gap, etc.] |\n',
        '| [Describe finding] | [Insert Ticket Number] | [Brief description of the finding] |\n',
        '| [Describe finding] | [Insert Ticket Number] | [Brief description of the finding] |'
      ]
    };
  }

  /**
   * Create the ACT phase code cell
   * @private
   */
  _createActCodeCell() {
    return {
      cell_type: 'code',
      execution_count: null,
      metadata: {},
      outputs: [],
      source: [
        '# ACT Phase - Generate Hunt Summary\n',
        'hunt_end_time = datetime.now()\n',
        'hunt_duration = hunt_end_time - hunt_start_time\n',
        '\n',
        'log_hunt_step("Hunt Summary", "Generating final hunt report")\n',
        '\n',
        '# Calculate hunt metrics\n',
        'total_events_analyzed = len(initial_results) if \'initial_results\' in locals() else 0\n',
        'suspicious_events_found = len(refined_results) if \'refined_results\' in locals() else 0\n',
        'false_positive_rate = "TBD - Requires validation"\n',
        '\n',
        'hunt_summary = {\n',
        '    "hunt_id": hunt_id,\n',
        '    "hunt_title": hunt_title,\n',
        '    "hypothesis": hunt_hypothesis,\n',
        '    "start_time": hunt_start_time,\n',
        '    "end_time": hunt_end_time,\n',
        '    "duration": hunt_duration,\n',
        '    "total_events_analyzed": total_events_analyzed,\n',
        '    "suspicious_events_found": suspicious_events_found,\n',
        '    "false_positive_rate": false_positive_rate\n',
        '}\n',
        '\n',
        'print("\\n" + "="*70)\n',
        'print("🔥 THOR COLLECTIVE HEARTH - HUNT SUMMARY REPORT")\n',
        'print("="*70)\n',
        'print(f"Hunt ID: {hunt_summary[\'hunt_id\']}")\n',
        'print(f"Hunt Title: {hunt_summary[\'hunt_title\']}")\n',
        'print(f"Hypothesis: {hunt_summary[\'hypothesis\']}")\n',
        'print(f"Duration: {hunt_summary[\'duration\']}")\n',
        'print(f"Total Events Analyzed: {hunt_summary[\'total_events_analyzed\']:,}")\n',
        'print(f"Suspicious Events Found: {hunt_summary[\'suspicious_events_found\']:,}")\n',
        'print(f"False Positive Rate: {hunt_summary[\'false_positive_rate\']}")\n',
        'print("="*70)\n',
        '\n',
        '# Export summary for documentation\n',
        'import json\n',
        'with open(f"hunt_summary_{hunt_id}.json", "w") as f:\n',
        '    json.dump(hunt_summary, f, indent=2, default=str)\n',
        '\n',
        'print(f"\\nHunt summary exported to: hunt_summary_{hunt_id}.json")'
      ]
    };
  }

  /**
   * Create the KNOWLEDGE phase markdown cell
   * @private
   */
  _createKnowledgeCell(huntData) {
    return {
      cell_type: 'markdown',
      metadata: {},
      source: [
        '## K - Knowledge: Lessons Learned & Documentation\n',
        '\n',
        '### **Adjustments to Future Hunts**\n',
        '- **What worked well?**\n',
        '- **What could be improved?**\n',
        '- **Should this hunt be automated as a detection?**\n',
        '- **Are there any follow-up hunts that should be conducted?**\n',
        '- **What feedback should be shared with other teams (SOC, IR, Threat Intel, Detection Engineering, etc.)?**\n',
        '\n',
        '### **Sharing Knowledge & Documentation**\n',
        '*(Ensure insights from this hunt are shared with the broader security team to improve future hunts and detections.)*\n',
        '\n',
        '- **Knowledge Base (KB) Articles**\n',
        '  - [ ] Write an internal KB article that captures:\n',
        '    - [ ] The hunt\'s objective, scope, and key findings\n',
        '    - [ ] Any detection logic or rule improvements\n',
        '    - [ ] Lessons learned that are relevant for future hunts or incident response\n',
        '  - [ ] Document newly uncovered insights or patterns that could benefit SOC, IR, or Detection Engineering teams, especially anything that could inform future detections, playbooks, or tuning decisions.\n',
        '\n',
        '- **Threat Hunt Readouts**\n',
        '  - [ ] Schedule a readout with SOC, IR, and Threat Intel teams.\n',
        '  - [ ] Present key findings and suggested improvements to detections.\n',
        '\n',
        '- **Reports & External Sharing**\n',
        '  - [ ] Publish findings in an internal hunt report.\n',
        '  - [ ] Share relevant insights with stakeholders, vendors, or industry communities if applicable.\n',
        '\n',
        '### **References**\n',
        `- ${huntData.references || '[Insert link to related documentation, reports, or sources]'}\n`,
        '- [Insert link to any external references or articles]\n',
        '\n',
        '---'
      ]
    };
  }

  /**
   * Create the conclusion markdown cell
   * @private
   */
  _createConclusionCell() {
    return {
      cell_type: 'markdown',
      metadata: {},
      source: [
        '## 📋 Conclusion\n',
        '\n',
        'This threat hunting notebook has been generated based on the PEAK framework methodology. The hunt provides:\n',
        '\n',
        '1. **Structured approach** following PEAK phases (Prepare, Execute, Act)\n',
        '2. **Actionable search queries** and detection logic\n',
        '3. **Visualization capabilities** for findings analysis\n',
        '4. **Documentation templates** for reporting and communication\n',
        '\n',
        '### Next Steps\n',
        '\n',
        '1. **Customize data sources** - Replace simulated data with your actual security logs\n',
        '2. **Validate findings** - Review and confirm any suspicious activities identified\n',
        '3. **Implement automation** - Convert successful hunts into automated detection rules\n',
        '4. **Schedule regular execution** - Run hunts periodically to maintain security posture\n',
        '\n',
        '### Knowledge Integration\n',
        '\n',
        'The Knowledge component of PEAK is integrated throughout this hunt:\n',
        '- Threat intelligence from research and CTI sources\n',
        '- Organizational context and business knowledge\n',
        '- Technical expertise and hunting experience\n',
        '- Findings from previous hunt iterations\n',
        '\n',
        '---\n',
        '\n',
        '## Credits & Additional Resources\n',
        '\n',
        'This notebook was generated by **THOR Collective HEARTH** using the official PEAK Threat Hunting Framework template.\n',
        '\n',
        '### THOR Collective Resources\n',
        '- **HEARTH Database:** https://hearth.thorcollective.com\n',
        '- **THOR Collective GitHub:** https://github.com/THORCollective\n',
        '- **Submit New Hunts:** https://github.com/THORCollective/HEARTH/issues/new/choose\n',
        '- **Notebook Generator:** https://github.com/THORCollective/threat-hunting-notebook-generator\n',
        '\n',
        '### PEAK Framework Resources\n',
        '- **PEAK Template Guide:** https://dispatch.thorcollective.com/p/the-peak-threat-hunting-template\n',
        '- **Framework Documentation:** https://github.com/THORCollective/HEARTH/blob/main/Kindling/PEAK-Template.md\n',
        '\n',
        '### Community\n',
        '- **Join the Community:** Contribute your own hunts to help the security community\n',
        '- **Share Your Results:** Consider sharing interesting findings with the broader security community\n',
        '- **Follow THOR Collective:** Stay updated on new tools and threat hunting resources\n',
        '\n',
        '---\n',
        '\n',
        '*Generated using the official PEAK Threat Hunting Framework template from THOR Collective HEARTH*\n',
        '\n',
        '**Happy Hunting! 🔥**'
      ]
    };
  }

  /**
   * Show hunt details as JSON for advanced notebook generation
   *
   * @param {string} huntId - The hunt identifier
   * @param {Array<Object>} huntsData - Array of all hunt objects
   * @param {HTMLElement} modalBody - The modal body element to populate
   * @param {Function} onBackToNotebook - Callback function when user clicks back
   */
  showHuntJsonData(huntId, huntsData, modalBody, onBackToNotebook) {
    const hunt = huntsData.find(h => h.id === huntId);
    if (!hunt) {
      return;
    }

    const huntData = {
      id: hunt.id,
      title: hunt.title || hunt.notes || 'Untitled Hunt',
      category: hunt.category,
      hypothesis: hunt.notes || hunt.title || '',
      tactic: hunt.tactic || '',
      tags: hunt.tags || [],
      references: hunt.references || '',
      why: hunt.why || '',
      submitter: hunt.submitter ? hunt.submitter.name : 'Unknown',
      file_path: hunt.file_path
    };

    modalBody.innerHTML = `
      <div class="hunt-json-data">
        <h3>Hunt Data for Advanced Notebook Generation</h3>
        <p>Copy the JSON below and use it with the THOR Collective
        <a href="https://github.com/THORCollective/threat-hunting-notebook-generator" target="_blank">threat-hunting-notebook-generator</a>
        tool for more advanced notebooks:</p>
        <div class="json-container">
          <pre class="json-code">${JSON.stringify(huntData, null, 2)}</pre>
        </div>
        <div class="json-actions">
          <button class="btn btn-primary" data-action="copy-json">
            Copy JSON
          </button>
          <button class="btn btn-secondary" data-action="back-to-notebook">
            Back to Notebook
          </button>
        </div>
        <div class="usage-instructions">
          <h4>Usage Instructions:</h4>
          <ol>
            <li>Copy the JSON data above</li>
            <li>Clone the THOR Collective threat-hunting-notebook-generator repository</li>
            <li>Save the JSON to a file (e.g., hunt_data.json)</li>
            <li>Run: <code>python -m src.main --input hunt_data.json --output notebook.ipynb</code></li>
          </ol>
        </div>
      </div>
    `;

    const copyButton = modalBody.querySelector('[data-action="copy-json"]');
    if (copyButton) {
      copyButton.addEventListener('click', (event) => {
        this._copyToClipboard(event, JSON.stringify(huntData, null, 2));
      });
    }

    const backButton = modalBody.querySelector('[data-action="back-to-notebook"]');
    if (backButton && onBackToNotebook) {
      backButton.addEventListener('click', () => onBackToNotebook(huntId));
    }
  }

  /**
   * Generate and download a Jupyter notebook for a hunt
   *
   * @param {string} huntId - The hunt identifier
   * @param {Array<Object>} huntsData - Array of all hunt objects
   * @param {HTMLElement} modalBody - The modal body element to populate
   * @param {Function} onShowJsonData - Callback to show JSON data view
   * @param {Function} onRegenerate - Callback to regenerate notebook
   * @returns {Promise<void>}
   */
  async generateNotebook(huntId, huntsData, modalBody, onShowJsonData, onRegenerate) {
    try {
      // Show loading indicator
      const loadingHtml = `
        <div class="notebook-loading">
          <div class="spinner"></div>
          <p>Generating Jupyter notebook...</p>
          <p class="loading-subtext">This may take a moment while we process your hunt hypothesis</p>
        </div>
      `;

      modalBody.innerHTML = loadingHtml;

      // Find the hunt data
      const hunt = huntsData.find(h => h.id === huntId);
      if (!hunt) {
        throw new Error('Hunt not found');
      }

      // Prepare hunt data for notebook generation
      const huntData = {
        id: hunt.id,
        title: hunt.title || hunt.notes || 'Untitled Hunt',
        category: hunt.category,
        hypothesis: hunt.notes || hunt.title || '',
        tactic: hunt.tactic || '',
        tags: hunt.tags || [],
        references: hunt.references || '',
        why: hunt.why || '',
        submitter: hunt.submitter ? hunt.submitter.name : 'Unknown',
        file_path: hunt.file_path
      };

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate notebook content
      const notebookContent = await this.generateNotebookContent(huntData);

      // Create a blob with the notebook content
      const blob = new Blob([notebookContent], { type: 'application/json' });
      const downloadUrl = URL.createObjectURL(blob);

      // Show success message with download link
      modalBody.innerHTML = `
        <div class="notebook-success">
          <h3>✅ Notebook Generated Successfully!</h3>
          <p>Your threat hunting notebook has been generated based on the PEAK framework.</p>
          <div class="notebook-actions">
            <a href="${downloadUrl}" class="btn btn-primary" download="${huntData.id}_threat_hunting_notebook.ipynb">
              Download Notebook (.ipynb)
            </a>
            <button class="btn btn-secondary" data-action="regenerate">
              Generate Another
            </button>
          </div>
          <div class="notebook-info">
            <h4>What's included:</h4>
            <ul>
              <li>PEAK framework structure (Prepare, Execute, Act)</li>
              <li>Hunt hypothesis and research questions</li>
              <li>Sample data analysis code</li>
              <li>Visualization templates</li>
              <li>Documentation templates</li>
            </ul>
          </div>
          <div class="notebook-github">
            <p><strong>Advanced Option:</strong> For more sophisticated notebook generation, you can use the THOR Collective
            <a href="https://github.com/THORCollective/threat-hunting-notebook-generator" target="_blank">threat-hunting-notebook-generator</a>
            tool with the following hunt data:</p>
            <button class="btn btn-secondary" data-action="show-json">
              Show Hunt Data
            </button>
          </div>
        </div>
      `;

      // Attach event listeners
      const regenerateButton = modalBody.querySelector('[data-action="regenerate"]');
      if (regenerateButton && onRegenerate) {
        regenerateButton.addEventListener('click', () => onRegenerate(huntId));
      }

      const showJsonButton = modalBody.querySelector('[data-action="show-json"]');
      if (showJsonButton && onShowJsonData) {
        showJsonButton.addEventListener('click', () => onShowJsonData(huntId));
      }

    } catch (error) {
      console.error('Error generating notebook:', error);

      // Show error message
      modalBody.innerHTML = `
        <div class="notebook-error">
          <h3>❌ Error Generating Notebook</h3>
          <p>We encountered an error while generating your notebook:</p>
          <p class="error-message">${error.message}</p>
          <div class="error-actions">
            <button class="btn btn-primary" data-action="retry">
              Try Again
            </button>
            <button class="btn btn-secondary" data-action="close">
              Close
            </button>
          </div>
          <div class="error-fallback">
            <p><strong>Alternative:</strong> You can manually create a notebook using the hunt details shown above and the THOR Collective
            <a href="https://github.com/THORCollective/threat-hunting-notebook-generator" target="_blank">threat-hunting-notebook-generator</a> tool.</p>
          </div>
        </div>
      `;

      const retryButton = modalBody.querySelector('[data-action="retry"]');
      if (retryButton && onRegenerate) {
        retryButton.addEventListener('click', () => onRegenerate(huntId));
      }

      const closeButton = modalBody.querySelector('[data-action="close"]');
      if (closeButton) {
        closeButton.addEventListener('click', () => location.reload());
      }
    }
  }

  /**
   * Copy text to clipboard with visual feedback
   *
   * @param {Event} event - The click event
   * @param {string} text - The text to copy
   * @private
   */
  _copyToClipboard(event, text) {
    if (event && typeof event.preventDefault === 'function') {
      event.preventDefault();
    }

    const trigger = event?.currentTarget || event?.target || null;
    const originalLabel = trigger ? trigger.textContent : '';

    const restoreLabel = () => {
      if (!trigger) {
        return;
      }
      setTimeout(() => {
        trigger.disabled = false;
        trigger.textContent = originalLabel;
      }, 2000);
    };

    const applySuccessState = () => {
      if (!trigger) {
        return;
      }
      trigger.disabled = true;
      trigger.textContent = '✓ Copied!';
    };

    const fallbackCopy = () => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'absolute';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      let successful = false;
      try {
        successful = document.execCommand('copy');
      } catch (error) {
        console.warn('Clipboard copy failed:', error);
      }
      document.body.removeChild(textarea);
      if (successful) {
        applySuccessState();
        restoreLabel();
      } else if (trigger) {
        trigger.textContent = 'Copy failed';
        restoreLabel();
      }
    };

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(text)
        .then(() => {
          applySuccessState();
          restoreLabel();
        })
        .catch((error) => {
          console.warn('Clipboard API error, falling back to execCommand:', error);
          fallbackCopy();
        });
    } else {
      fallbackCopy();
    }
  }
}
