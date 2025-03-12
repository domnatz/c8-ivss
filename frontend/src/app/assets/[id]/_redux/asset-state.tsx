import { Asset } from "@/models/asset";

export const initialState: Asset & {
  selectedSubgroupId: number | null;
  selectedSubgroupTagId: number | null;
} = {
  asset_id: 0,
  asset_type: "",
  asset_name: "",
  subgroups: [],
  selectedSubgroupId: null,
  selectedSubgroupTagId: null,
};
