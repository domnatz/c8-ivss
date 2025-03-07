import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "./asset-state";
import { Asset } from "@/models/asset";
import { Subgroup } from "@/models/subgroup";
import { Subgroup_tag } from "@/models/subgroup-tag";

export const assetSlice = createSlice({
  name: "assetSlice",
  initialState,
  reducers: {
    setAsset: (state, action: PayloadAction<Asset>) => {
      return action.payload;
    },

    addSubgroup: (state, action: PayloadAction<Subgroup>) => {
      state.subgroups?.push(action.payload);
    },

    updateSubgroupName: (
      state,
      action: PayloadAction<{ id: number; name: string }>
    ) => {
      const subgroup = state.subgroups?.find(
        (s) => s.subgroup_id === action.payload.id
      );
      if (subgroup) {
        subgroup.subgroup_name = action.payload.name;
      }
    },

    addTagToSubgroup: (
      state,
      action: PayloadAction<{
        subgroupId: number;
        tag: Subgroup_tag;
      }>
    ) => {
      const { subgroupId, tag } = action.payload;
      const subgroup = state.subgroups?.find(
        (s) => s.subgroup_id === subgroupId
      );
      if (subgroup) {
        if (!subgroup.subgroup_tags) {
          subgroup.subgroup_tags = [];
        }
        subgroup.subgroup_tags.push(tag);
      }
    },
  },
});

export const { setAsset, addSubgroup, updateSubgroupName, addTagToSubgroup } =
  assetSlice.actions;

export default assetSlice.reducer;
