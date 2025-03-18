import { Formula, FormulaEvaluation, Template } from "@/models/formula";

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

  createFormula: async (formula: Formula): Promise<Formula> => {
    const response = await fetch(`${BASE_URL}/formulas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formula),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create formula');
    }
    return response.json();
  },

  updateFormula: async (formulaId: number, formula: Formula): Promise<Formula> => {
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