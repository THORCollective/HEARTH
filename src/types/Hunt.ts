export type HuntCategory = 'Flames' | 'Embers' | 'Alchemy';
export type HuntSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational';
export type HuntStatus = 'current' | 'stale' | 'retired';

export interface DetectionQuery {
  platform: string;
  description?: string;
  query: string;
}

export interface Hunt {
  id: string;
  category: HuntCategory;
  title: string;
  tactic: string;
  notes: string;
  tags: string[];
  techniques?: string[];
  severity?: HuntSeverity;
  status?: HuntStatus;
  related_hunt_ids?: string[];
  required_data_sources?: string[];
  detection_queries?: DetectionQuery[];
  false_positive_notes?: string;
  submitter: { name: string; link: string };
  why: string;
  references: string;
  file_path: string;
}
