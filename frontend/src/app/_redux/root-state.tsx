import { Asset } from "../../models/asset";

export interface RootState {
  menuOpen: boolean;
  assets: Asset[];
  filter: string;
  searchQuery: string;
  editingAssetId: number | null;
  editingSubgroupId: string | null;
  editingValues: {
    [key: string]: string;
  };
}
