import { AppDispatch } from "@/store";
import { getAllFormulas, createFormula, getFormulaById, updateFormula, deleteFormula, getFormulaVariables, getFormulaVariablesWithMappings} from "@/_services/formula-service";
import { Formula, FormulaEvaluation, Template } from "@/models/formula";

// Define a fallback URL to use if environment variable isn't set
const BASE_URL = process.env.BASE_URL || "http://localhost:8000/api";

export const formulaService = {
  getAllFormulas: async (): Promise<Formula[]> => {
    return getAllFormulas();
  },

  getFormulaById: async (formulaId: number): Promise<Formula> => {
    return getFormulaById(formulaId);
  },

  createFormula: async (formula: Omit<Formula, 'formula_id'>): Promise<Formula> => {
    return createFormula(formula);
  },

  updateFormula: async (formulaId: number, formula: Omit<Formula, 'formula_id'>): Promise<Formula> => {
    return updateFormula(formulaId, formula);
  },

  deleteFormula: async (formulaId: number): Promise<void> => {
    return deleteFormula(formulaId);
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

  getFormulaTemplates: async (formulaId: number): Promise<Template[]> => {
    const response = await fetch(`${BASE_URL}/formulas/${formulaId}/templates`);
    if (!response.ok) {
      throw new Error(`Failed to fetch templates for formula with ID ${formulaId}`);
    }
    return response.json();
  },
  getFormulaVariables: async (formulaId: number): Promise<Array<{ variable_name: string, variable_id?: number }>> => {
    return getFormulaVariables(formulaId);
  },
  
  // Add this new method
  getFormulaVariablesWithMappings: async (formulaId: number, contextTagId: number): Promise<any[]> => {
    return getFormulaVariablesWithMappings(formulaId, contextTagId);
  },
  
};

// New client-side functions for component integration
export const formulaClientService = {
  loadFormulas: async (dispatch: AppDispatch): Promise<void> => {
    dispatch({ type: 'assetSlice/setFormulasLoading', payload: true });
    try {
      const formulas = await formulaService.getAllFormulas();
      dispatch({ type: 'assetSlice/setFormulas', payload: formulas });
    } catch (error) {
      console.error("Error loading formulas:", error);
    } finally {
      dispatch({ type: 'assetSlice/setFormulasLoading', payload: false });
    }
  },

  submitFormula: async (formulaData: Omit<Formula, 'formula_id'>, dispatch: AppDispatch): Promise<boolean> => {
    try {
      const newFormula = await formulaService.createFormula(formulaData);
      dispatch({ type: 'assetSlice/addFormula', payload: newFormula });
      return true;
    } catch (error) {
      console.error("Error submitting formula:", error);
      return false;
    }
  },

  selectFormula: (formula: Formula, dispatch: AppDispatch): void => {
    dispatch({ type: 'assetSlice/setFormulaInput', payload: formula.formula_expression });
  },

  getFormulaVariables: async (formulaId: number): Promise<Array<{ variable_name: string, variable_id?: number }>> => {
    try {
      return await formulaService.getFormulaVariables(formulaId);
    } catch (error) {
      console.error("Error loading formula variables:", error);
      return [];
    }
  },
  
  // Add this new method
  getFormulaVariablesWithMappings: async (formulaId: number, contextTagId: number): Promise<any[]> => {
    try {
      return await formulaService.getFormulaVariablesWithMappings(formulaId, contextTagId);
    } catch (error) {
      console.error("Error loading formula variables with mappings:", error);
      return [];
    }
  }
};

