/**
 * Represents a threat hunting hypothesis in HEARTH
 */
export interface Hunt {
  /** Unique hunt identifier (e.g., "H001", "B001", "M001") */
  id: string;

  /** Hunt category from PEAK framework */
  category: 'Flames' | 'Embers' | 'Alchemy';

  /** Hunt hypothesis title/description */
  title: string;

  /** MITRE ATT&CK tactic(s) */
  tactic: string;

  /** Implementation notes */
  notes: string;

  /** Tags for categorization and search */
  tags: string[];

  /** Submitter information */
  submitter: {
    name: string;
    link: string;
  };

  /** Rationale: why this hunt is valuable */
  why: string;

  /** References and sources */
  references: string;

  /** Relative file path to markdown source */
  file_path: string;
}
