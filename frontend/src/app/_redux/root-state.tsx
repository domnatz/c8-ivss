import { Asset } from "../../models/asset";
import { Masterlist } from "../../models/masterlist";

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
  currentAsset?: Asset;
  // Masterlist state
  masterlists: Masterlist[];
  selectedMasterlistId: number | null;
  masterlistLoading: boolean;
  masterlistUploading: boolean;
}
