import { Formula, FormulaEvaluation, Template } from "@/models/formula";
import { toast } from "react-toastify";
import { getAllFormulas as fetchAllFormulas, createFormula as createFormulaAction } from "@/_actions/formula-actions";
import { assetAction } from "@/app/assets/[id]/_redux/asset-slice";
import { AppDispatch } from "@/store";

// Define a fallback URL to use if environment variable isn't set
const BASE_URL = process.env.BASE_URL || "http://localhost:8000/api";

export const formulaService = {
  getAllFormulas: async (): Promise<Formula[]> => {
    const response = await fetch(`${BASE_URL}/formulas`);
    if (!response.ok) {
      throw new Error('Failed to fetch formulas');
    }
    return response.json();
  },

  getFormulaById: async (formulaId: number): Promise<Formula> => {
    const response = await fetch(`${BASE_URL}/formulas/${formulaId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch formula');
    }
    return response.json();
  },

  createFormula: async (formula: Omit<Formula, 'formula_id'>): Promise<Formula> => {
    const response = await fetch(`${BASE_URL}/formulas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formula),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create formula');
    }
    return response.json();
  },

  updateFormula: async (formulaId: number, formula: Omit<Formula, 'formula_id'>): Promise<Formula> => {
    const response = await fetch(`${BASE_URL}/formulas/${formulaId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formula),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update formula');
    }
    return response.json();
  },

  deleteFormula: async (formulaId: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/formulas/${formulaId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete formula');
    }
  },

  evaluateFormula: async (evaluation: FormulaEvaluation): Promise<FormulaEvaluation> => {
    const response = await fetch(`${BASE_URL}/formulas/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(evaluation),
    });
    
    if (!response.ok) {
      throw new Error('Failed to evaluate formula');
    }
    return response.json();
  },

  // Template related functions
  getFormulaTemplates: async (formulaId: number): Promise<Template[]> => {
    const response = await fetch(`${BASE_URL}/formulas/${formulaId}/templates`);
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    return response.json();
  },
};

// New client-side functions for component integration
export const formulaClientService = {
  loadFormulas: async (dispatch: AppDispatch): Promise<void> => {
    dispatch(assetAction.setFormulasLoading(true));
    try {
      const result = await fetchAllFormulas();
      if (result.success) {
        dispatch(assetAction.setFormulas(result.data));
      } else {
        toast.error(`Error fetching formulas: ${result.error}`);
      }
    } catch (error) {
      console.error("Error fetching formulas:", error);
      toast.error("Failed to fetch formulas");
    } finally {
      dispatch(assetAction.setFormulasLoading(false));
    }
  },

  submitFormula: async (formulaData: Omit<Formula, 'formula_id'>, dispatch: AppDispatch): Promise<boolean> => {
    try {
      const result = await createFormulaAction(formulaData);
      
      if (result.success) {
        // Add the new formula to the Redux store
        if (result.data) {
          dispatch(assetAction.addFormula(result.data));
          // Optionally select the newly created formula
          dispatch(assetAction.setFormulaInput(result.data.formula_expression));
        }
        return true;
      } else {
        toast.error(`Error creating formula: ${result.error}`);
        return false;
      }
    } catch (error) {
      console.error("Error creating formula:", error);
      toast.error(`Error creating formula: ${(error as Error).message}`);
      return false;
    }
  },

  selectFormula: (formula: Formula, dispatch: AppDispatch): void => {
    dispatch(assetAction.setFormulaInput(formula.formula_expression));
  }
};