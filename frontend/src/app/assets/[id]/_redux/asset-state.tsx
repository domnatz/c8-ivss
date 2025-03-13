import { Asset } from "@/models/asset";
import { Subgroup_tag } from "@/models/subgroup-tag"; // Import Subgroup_tag

export const initialState: Asset & {
  selectedSubgroupId: number | null;
  selectedSubgroupTagId: Subgroup_tag | null; // Update type to Subgroup_tag
} = {
  asset_id: 0,
  asset_type: "",
  asset_name: "",
  subgroups: [],
  selectedSubgroupId: null,
  selectedSubgroupTagId: null,
};
