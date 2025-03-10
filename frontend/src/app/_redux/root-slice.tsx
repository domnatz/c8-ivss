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
    assetsSet(state: RootState, action: PayloadAction<Asset[]>) {
      return {
        ...state,
        assets: action.payload,
      };
    },
    filterSet(state: RootState, action: PayloadAction<string>) {
      return {
        ...state,
        filter: action.payload,
      };
    },
    searchQuerySet(state: RootState, action: PayloadAction<string>) {
      return {
        ...state,
        searchQuery: action.payload,
      };
    },
    // New reducers for editing state
    editingAssetIdSet(state: RootState, action: PayloadAction<number | null>) {
      return {
        ...state,
        editingAssetId: action.payload,
      };
    },
    editingSubgroupIdSet(
      state: RootState,
      action: PayloadAction<string | null>
    ) {
      return {
        ...state,
        editingSubgroupId: action.payload,
      };
    },
    editingValueChanged(
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
    editingCleared(state: RootState) {
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
