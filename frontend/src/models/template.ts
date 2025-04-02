import { Subgroup } from "./subgroup";

export interface Template {
  asset_id: number;
  asset_type: string;
  asset_name: string;
  subgroups?: Subgroup[];
}

export interface SaveTemplateParams {
  template_name: string;
  formula_id: number;
}
