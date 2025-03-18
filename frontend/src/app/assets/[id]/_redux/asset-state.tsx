import { Asset } from "@/models/asset";
import { Subgroup_tag } from "@/models/subgroup-tag";

export const initialState: {
  asset_id: number;
  asset_type: string;
  asset_name: string;
  subgroups: any[];
  selectedSubgroupId: number | null;
  selectedSubgroupTagId: number | null; // Store just the ID
  selectedSubgroupTag: Subgroup_tag | null; // Store the full tag object
  selectedAsset: Asset | null;
  loading: boolean;
  error: string | null;
} = {
  asset_id: 0,
  asset_type: "",
  asset_name: "",
  subgroups: [],
  selectedSubgroupId: null,
  selectedSubgroupTagId: null,
  selectedSubgroupTag: null, // Initialize as null
  selectedAsset: null,
  loading: false,
  error: null,
};