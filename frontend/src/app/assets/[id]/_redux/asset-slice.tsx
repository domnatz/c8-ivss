import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initialState } from "./asset-state";
import { Asset } from "@/models/asset";
import { Subgroup } from "@/models/subgroup";
import { Subgroup_tag } from "@/models/subgroup-tag";
import { Formula } from "@/models/formula";
import { Template } from "@/models/template";

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

    // Add removeFormula reducer for formula deletion
    removeFormula: (state, action: PayloadAction<number>) => {
      return {
        ...state,
        formulas: state.formulas.filter(formula => formula.formula_id !== action.payload),
      };
    },

    // Add the setSelectedFormulaId reducer
    setSelectedFormulaId: (state, action: PayloadAction<number | null>) => {
      state.selectedFormulaId = action.payload;
      if (state.selectedSubgroupTag) {
        state.selectedSubgroupTag.formula_id = action.payload;
      }
    },

    // Formula creation state reducers
    setFormulaName: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        formulaName: action.payload,
      };
    },
    
    setFormulaExpression: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        formulaExpression: action.payload,
      };
    },
    
    setFormulaDesc: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        formulaDesc: action.payload,
      };
    },
    
    setIsCreatingFormula: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        isCreatingFormula: action.payload,
      };
    },
    
    // Reset formula creation form
    resetFormulaForm: (state) => {
      return {
        ...state,
        formulaName: "",
        formulaExpression: "",
        formulaDesc: "",
        isCreatingFormula: false,
      };
    },

    // Template reducers
    setTemplates: (state, action: PayloadAction<Template[]>) => {
      return {
        ...state,
        templates: action.payload,
      };
    },
    
    setTemplatesLoading: (state, action: PayloadAction<boolean>) => {
      return {
        ...state,
        templatesLoading: action.payload,
      };
    },
    
    // Add a new template to the list
    addTemplate: (state, action: PayloadAction<Template>) => {
      return {
        ...state,
        templates: [action.payload, ...state.templates],
      };
    },
  },
});

export const assetAction = assetSlice.actions;

export default assetSlice.reducer;