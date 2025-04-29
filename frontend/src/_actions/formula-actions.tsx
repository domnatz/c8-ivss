"use server";

import { Formula, FormulaEvaluation, Template } from "@/models/formula";
import { 
  getAllFormulas, 
  createFormula, 
  getFormulaById, 
  updateFormula, 
  deleteFormula, 
  getFormulaVariables, 
  getFormulaVariablesWithMappings, 
  getFormulaBySubgroupTagId,
  evaluateFormula,
  getFormulaTemplates
} from "@/_services/formula-service";
import { revalidateTag } from "next/cache";

export async function fetchAllFormulas() {
  try {
    const formulas = await getAllFormulas();
    return { success: true, data: formulas };
  } catch (error: any) {
    console.error("There was an error fetching formulas!", error);
    return { success: false, error: error.message };
  }
}

export async function fetchFormulaById(formulaId: number) {
  try {
    const formula = await getFormulaById(formulaId);
    return { success: true, data: formula };
  } catch (error: any) {
    console.error(`There was an error fetching formula with ID ${formulaId}!`, error);
    return { success: false, error: error.message };
  }
}

export async function addFormula(formula: Omit<Formula, 'formula_id'>) {
  try {
    const newFormula = await createFormula(formula);
    revalidateTag('formulas');
    return { success: true, data: newFormula };
  } catch (error: any) {
    console.error("There was an error creating formula!", error);
    return { success: false, error: error.message };
  }
}

export async function editFormula(formulaId: number, formula: Omit<Formula, 'formula_id'>) {
  try {
    const updatedFormula = await updateFormula(formulaId, formula);
   revalidateTag('formulas');
    return { success: true, data: updatedFormula };
  } catch (error: any) {
    console.error(`There was an error updating formula with ID ${formulaId}!`, error);
    return { success: false, error: error.message };
  }
}

export async function removeFormula(formulaId: number) {
  try {
    await deleteFormula(formulaId);
    revalidateTag('formulas');
    return { success: true };
  } catch (error: any) {
    console.error(`There was an error deleting formula with ID ${formulaId}!`, error);
    return { success: false, error: error.message };
  }
}

export async function evaluateFormulaExpression(evaluation: FormulaEvaluation) {
  try {
    const result = await evaluateFormula(evaluation);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("There was an error evaluating formula!", error);
    return { success: false, error: error.message };
  }
}

export async function fetchFormulaTemplates(formulaId: number) {
  try {
    const templates = await getFormulaTemplates(formulaId);
    return { success: true, data: templates };
  } catch (error: any) {
    console.error(`There was an error fetching templates for formula with ID ${formulaId}!`, error);
    return { success: false, error: error.message };
  }
}

export async function fetchFormulaVariables(formulaId: number) {
  try {
    const variables = await getFormulaVariables(formulaId);
    return { success: true, data: variables };
  } catch (error: any) {
    console.error(`There was an error fetching variables for formula with ID ${formulaId}!`, error);
    return { success: false, error: error.message };
  }
}

export async function fetchFormulaVariablesWithMappings(formulaId: number, contextTagId: number) {
  try {
    const variablesWithMappings = await getFormulaVariablesWithMappings(formulaId, contextTagId);
    return { success: true, data: variablesWithMappings };
  } catch (error: any) {
    console.error(`There was an error fetching variable mappings!`, error);
    return { success: false, error: error.message };
  }
}

export async function fetchFormulaBySubgroupTagId(subgroupTagId: number) {
  try {
    const formula = await getFormulaBySubgroupTagId(subgroupTagId);
    return { success: true, data: formula };
  } catch (error: any) {
    console.error(`There was an error fetching formula for subgroup tag with ID ${subgroupTagId}!`, error);
    return { success: false, error: error.message };
  }
}

