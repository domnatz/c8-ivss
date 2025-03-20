import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "./asset-state";
import { Asset } from "@/models/asset";
import { Subgroup } from "@/models/subgroup";
import { Subgroup_tag } from "@/models/subgroup-tag";
import { Formula } from "@/models/formula";

export const assetSlice = createSlice({
  name: "assetSlice",
  initialState,
  reducers: {
    assetLoaded: (state, action: PayloadAction<Asset>) => {
      return { ...state, ...action.payload };
    },

    subgroupAdded: (state, action: PayloadAction<Subgroup>) => {
      return {
        ...state,
        subgroups: [...(state.subgroups || []), action.payload],
      };
    },

    subgroupNameUpdated: (
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

    // New reducers for selecting subgroups and tags
    selectSubgroup: (state, action: PayloadAction<number | null>) => {
      return {
        ...state,
        selectedSubgroupId: action.payload,
        // Reset selected tag when changing subgroups
        selectedSubgroupTagId: null,
        selectedSubgroupTag: null, // Add this to track the full tag object
      };
    },

    selectSubgroupTag: (state, action: PayloadAction<Subgroup_tag | null>) => { // Update type to Subgroup_tag
      return {
        ...state,
        selectedSubgroupTagId: action.payload?.subgroup_tag_id || null,
        selectedSubgroupTag: action.payload, // Store the full tag object
      };
    },
    
    setSelectedAsset: (state, action: PayloadAction<Asset | null>) => {
      return {
        ...state,
        selectedAsset: action.payload,
      };
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        loading: action.payload,
      };
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      return {
        ...state,
        error: action.payload,
      };
    },
    
    // Add a reducer to update tags for a subgroup
    updateSubgroupTags: (
      state,
      action: PayloadAction<{
        subgroupId: number;
        tags: Subgroup_tag[];
      }>
    ) => {
      const { subgroupId, tags } = action.payload;
      return {
        ...state,
        subgroups: state.subgroups?.map((subgroup) =>
          subgroup.subgroup_id === subgroupId
            ? { ...subgroup, subgroup_tags: tags }
            : subgroup
        ),
      };
    },

    // Child tags reducers
    setChildTags: (state, action: PayloadAction<Subgroup_tag[]>) => {
      return {
        ...state,
        childTags: action.payload,
      };
    },
    
    setChildTagsLoading: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        childTagsLoading: action.payload,
      };
    },
    
    // Formula reducers
    setFormulas: (state, action: PayloadAction<Formula[]>) => {
      return {
        ...state,
        formulas: action.payload,
      };
    },
    
    setFormulasLoading: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        formulasLoading: action.payload,
      };
    },
    
    setFormulaInput: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        formulaInput: action.payload,
      };
    },
    
    addFormula: (state, action: PayloadAction<Formula>) => {
      return {
        ...state,
        formulas: [...state.formulas, action.payload],
      };
    },
  },
});

export const assetAction = assetSlice.actions;

export default assetSlice.reducer;
