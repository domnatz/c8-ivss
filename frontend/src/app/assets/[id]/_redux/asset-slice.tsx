import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Asset } from "@/models/asset";
import { Subgroup } from "@/models/subgroup";
import { Subgroup_tag } from "@/models/subgroup-tag";
import { Tags } from "@/models/tags";
import { AssetState } from "./asset-state";

const initialState: AssetState = {
  asset: {
    asset_id: 0,
    asset_type: "",
    asset_name: "",
    subgroups: [],
  },
  selectedSubgroupId: null,
  selectedSubgroupTagId: null,
  availableTags: [],
};

export const assetSlice = createSlice({
  name: "assetSlice",
  initialState,
  reducers: {
    availableTagsLoaded: (state, action: PayloadAction<Tags[]>) => {
      return {
        ...state,
        availableTags: action.payload,
      };
    },

    assetLoaded: (state, action: PayloadAction<Asset>) => {
      return {
        ...state,
        asset: action.payload,
      };
    },

    subgroupAdded: (state, action: PayloadAction<Subgroup>) => {
      return {
        ...state,
        asset: {
          ...state.asset,
          subgroups: [...(state.asset.subgroups || []), action.payload],
        },
      };
    },

    subgroupNameUpdated: (
      state,
      action: PayloadAction<{ id: number; name: string }>
    ) => {
      return {
        ...state,
        asset: {
          ...state.asset,
          subgroups: state.asset.subgroups?.map((subgroup) =>
            subgroup.subgroup_id === action.payload.id
              ? { ...subgroup, subgroup_name: action.payload.name }
              : subgroup
          ),
        },
      };
    },

    subgroupTagAdded: (
      state,
      action: PayloadAction<{
        subgroupId: number;
        tag: Subgroup_tag;
      }>
    ) => {
      const { subgroupId, tag } = action.payload;
      return {
        ...state,
        asset: {
          ...state.asset,
          subgroups: state.asset.subgroups?.map((subgroup) =>
            subgroup.subgroup_id === subgroupId
              ? {
                  ...subgroup,
                  subgroup_tags: [...(subgroup.subgroup_tags || []), tag],
                }
              : subgroup
          ),
        },
      };
    },

    // New reducers for selecting subgroups and tags
    selectSubgroup: (state, action: PayloadAction<number | null>) => {
      return {
        ...state,
        selectedSubgroupId: action.payload,
        selectedSubgroupTagId: null,
      };
    },

    selectSubgroupTag: (state, action: PayloadAction<Subgroup_tag | null>) => {
      return {
        ...state,
        selectedSubgroupTagId: action.payload,
      };
    },
    subgroupTagsUpdated: (
      state,
      action: PayloadAction<{
        subgroupId: number;
        tags: Subgroup_tag[];
      }>
    ) => {
      const { subgroupId, tags } = action.payload;
      return {
        ...state,
        asset: {
          ...state.asset,
          subgroups: state.asset.subgroups?.map((subgroup) =>
            subgroup.subgroup_id === subgroupId
              ? { ...subgroup, subgroup_tags: tags }
              : subgroup
          ),
        },
      };
    },
  },
});

export const assetAction = assetSlice.actions;

export default assetSlice.reducer;
