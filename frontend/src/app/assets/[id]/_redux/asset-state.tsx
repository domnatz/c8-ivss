import { Asset } from "@/models/asset";
import { Subgroup_tag } from "@/models/subgroup-tag";
import { Tags } from "@/models/tags";

export interface AssetState {
  asset: Asset;
  selectedSubgroupId: number | null;
  selectedSubgroupTagId: Subgroup_tag | null;
  availableTags: Tags[];
}
