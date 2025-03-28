'use server';

import { formulaVariableService } from "@/_services/formula-variable-service";

/**
 * Fetch variable mappings for a subgroup tag
 */
export async function getVariableMappings(subgroupTagId: number) {
  try {
    return await formulaVariableService.getVariableMappings(subgroupTagId);
  } catch (error) {
    console.error("Error in getVariableMappings action:", error);
    throw error;
  }
}

/**
 * Remove variable mapping
 */
export async function removeVariableMapping(subgroupTagId: number, variableId: number) {
  try {
    return await formulaVariableService.removeVariableMapping(subgroupTagId, variableId);
  } catch (error) {
    console.error("Error in removeVariableMapping action:", error);
    throw error;
  }
}
