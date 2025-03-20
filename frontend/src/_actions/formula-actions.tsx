"use server";

import { revalidatePath } from "next/cache";
import { Formula } from "@/models/formula";

// Define a fallback URL to use if environment variable isn't set
const BASE_URL = process.env.BASE_URL || "http://localhost:8000/api";

export async function createFormula(formula: Formula) {
  try {
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

    const data = await response.json();
    revalidatePath('/formulas');
    return { success: true, data };
  } catch (error) {
    console.error('Error creating formula:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function evaluateFormula(formulaExpression: string, parameters: Record<string, any>) {
  try {
    const response = await fetch(`${BASE_URL}/evaluate_formula`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ formula_expression: formulaExpression, parameters }),
    });

    if (!response.ok) {
      throw new Error('Failed to evaluate formula');
    }

    const data = await response.json();
    return { success: true, result: data.result };
  } catch (error) {
    console.error('Error evaluating formula:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getAllFormulas() {
  try {
    const response = await fetch(`${BASE_URL}/formulas`);

    if (!response.ok) {
      throw new Error('Failed to fetch formulas');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching formulas:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getFormulaById(formulaId: number) {
  try {
    const response = await fetch(`${BASE_URL}/formulas/${formulaId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch formula');
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error fetching formula:', error);
    return { success: false, error: (error as Error).message };
  }
}