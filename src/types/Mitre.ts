export interface MitreTactic {
  id: string;
  shortname: string;
  name: string;
}

export interface MitreTechnique {
  id: string;
  name: string;
  parent: string | null;
  tactic_shortnames: string[];
  description: string;
  url: string;
  is_subtechnique: boolean;
}

export interface MitreMatrix {
  tactics: MitreTactic[];
  techniques: MitreTechnique[];
}
