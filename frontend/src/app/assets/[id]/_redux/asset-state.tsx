import { Asset } from "@/models/asset";
import { Subgroup_tag } from "@/models/subgroup-tag";
import { Formula } from "@/models/formula";

export const initialState: {
  asset_id: number;
  asset_type: string;
  asset_name: string;
  subgroups: any[];
  selectedSubgroupId: number | null;
  selectedSubgroupTagId: number | null;
  selectedSubgroupTag: Subgroup_tag | null;
  selectedAsset: Asset | null;
  loading: boolean;
  error: string | null;
  // New state properties
  childTags: Subgroup_tag[];
  childTagsLoading: boolean;
  formulas: Formula[];
  formulasLoading: boolean;
  formulaInput: string;
  selectedFormulaId: number | null;
  // Formula creation states
  formulaName: string;
  formulaExpression: string;
  formulaDesc: string;
  isCreatingFormula: boolean;
} = {
  asset_id: 0,
  asset_type: "",
  asset_name: "",
  subgroups: [],
  selectedSubgroupId: null,
  selectedSubgroupTagId: null,
  selectedSubgroupTag: null,
  selectedAsset: null,
  loading: false,
  error: null,
  // Initialize new state properties
  childTags: [],
  childTagsLoading: false,
  formulas: [],
  formulasLoading: false,
  formulaInput: "",
  selectedFormulaId: null,
  // Initialize formula creation states
  formulaName: "",
  formulaExpression: "",
  formulaDesc: "",
  isCreatingFormula: false,
};