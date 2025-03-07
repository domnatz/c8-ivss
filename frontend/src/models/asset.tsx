import { Subgroup } from "./subgroup";

export interface Asset {
  asset_id: number;
  asset_type: string;
  asset_name: string;
  subgroups?: Subgroup[];
}
