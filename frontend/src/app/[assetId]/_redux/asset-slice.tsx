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
      return { ...state, ...action.payload };
    },

    addSubgroup: (state, action: PayloadAction<Subgroup>) => {
      return {
        ...state,
        subgroups: [...(state.subgroups || []), action.payload],
      };
    },

    updateSubgroupName: (
      state,
      action: PayloadAction<{ id: number; name: string }>
    ) => {
      return {
        ...state,
        subgroups: state.subgroups?.map((subgroup) =>
          subgroup.subgroup_id === action.payload.id
            ? { ...subgroup, subgroup_name: action.payload.name }
            : subgroup
        ),
      };
    },

    addTagToSubgroup: (
      state,
      action: PayloadAction<{
        subgroupId: number;
        tag: Subgroup_tag;
      }>
    ) => {
      const { subgroupId, tag } = action.payload;
      return {
        ...state,
        subgroups: state.subgroups?.map((subgroup) =>
          subgroup.subgroup_id === subgroupId
            ? {
                ...subgroup,
                subgroup_tags: [...(subgroup.subgroup_tags || []), tag],
              }
            : subgroup
        ),
      };
    },
  },
});

export const assetAction = assetSlice.actions;

export default assetSlice.reducer;
