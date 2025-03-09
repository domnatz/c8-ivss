import { RootState } from "./root-state";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Asset } from "../../models/asset";

export const initialState: RootState = {
  menuOpen: false,
  assets: [],
  filter: "newest",
  searchQuery: "",
  editingAssetId: null,
  editingSubgroupId: null,
  editingValues: {},
};

export const rootSlice = createSlice({
  name: "rootSlice",
  initialState,
  reducers: {
    collapseToggled(state: RootState) {
      return {
        ...state,
        menuOpen: !state.menuOpen,
      };
    },
    setAssets(state: RootState, action: PayloadAction<Asset[]>) {
      return {
        ...state,
        assets: action.payload,
      };
    },
    setFilter(state: RootState, action: PayloadAction<string>) {
      return {
        ...state,
        filter: action.payload,
      };
    },
    setSearchQuery(state: RootState, action: PayloadAction<string>) {
      return {
        ...state,
        searchQuery: action.payload,
      };
    },
    // New reducers for editing state
    setEditingAssetId(state: RootState, action: PayloadAction<number | null>) {
      return {
        ...state,
        editingAssetId: action.payload,
      };
    },
    setEditingSubgroupId(
      state: RootState,
      action: PayloadAction<string | null>
    ) {
      return {
        ...state,
        editingSubgroupId: action.payload,
      };
    },
    updateEditingValue(
      state: RootState,
      action: PayloadAction<{ key: string; value: string }>
    ) {
      return {
        ...state,
        editingValues: {
          ...state.editingValues,
          [action.payload.key]: action.payload.value,
        },
      };
    },
    clearEditing(state: RootState) {
      const newValues = { ...state.editingValues };
      Object.keys(newValues).forEach((key) => {
        if (key.startsWith("asset-") || key.startsWith("subgroup-")) {
          delete newValues[key];
        }
      });

      return {
        ...state,
        editingAssetId: null,
        editingSubgroupId: null,
        editingValues: newValues,
      };
    },
  },
});

export const rootActions = rootSlice.actions;

export default rootSlice.reducer;
