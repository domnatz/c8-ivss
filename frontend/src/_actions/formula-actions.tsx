"use server";

import { Formula } from "@/models/formula";

// Define the server-side formula actions
export async function getAllFormulas(): Promise<Formula[]> {
  const response = await fetch(`${process.env.BASE_URL || "http://localhost:8000/api"}/formulas`);
  if (!response.ok) {
    throw new Error('Failed to fetch formulas');
  }
  return response.json();
}

export async function createFormula(formula: Omit<Formula, 'formula_id'>): Promise<Formula> {
  const response = await fetch(`${process.env.BASE_URL || "http://localhost:8000/api"}/formulas`, {
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
}

export async function getFormulaById(formulaId: number): Promise<Formula> {
  const response = await fetch(`${process.env.BASE_URL || "http://localhost:8000/api"}/formulas/${formulaId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch formula with ID ${formulaId}`);
  }
  return response.json();
}

export async function updateFormula(formulaId: number, formula: Omit<Formula, 'formula_id'>): Promise<Formula> {
  const response = await fetch(`${process.env.BASE_URL || "http://localhost:8000/api"}/formulas/${formulaId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formula),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to update formula with ID ${formulaId}`);
  }
  return response.json();
}

export async function deleteFormula(formulaId: number): Promise<void> {
  const response = await fetch(`${process.env.BASE_URL || "http://localhost:8000/api"}/formulas/${formulaId}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error(`Failed to delete formula with ID ${formulaId}`);
  }
}