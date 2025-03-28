

const BASE_URL = process.env.BASE_URL || "http://localhost:8000/api";

/**
 * Service for handling formula variable mappings
 */
export const formulaVariableService = {
  /**
   * Get variable mappings for a specific subgroup tag
   * @param subgroupTagId The ID of the subgroup tag
   * @returns Promise with the variable mappings
   */
  getVariableMappings: async (subgroupTagId: number) => {
    try {
      const response = await fetch(`${BASE_URL}/subgroup-tags/${subgroupTagId}/variable-mappings`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch variable mappings: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching variable mappings:", error);
      throw error;
    }
  },

  /**
   * Remove a variable mapping
   * @param subgroupTagId The ID of the subgroup tag
   * @param variableId The ID of the variable
   * @returns Promise with the operation result
   */
  removeVariableMapping: async (subgroupTagId: number, variableId: number) => {
    try {
      const response = await fetch(`${BASE_URL}/subgroup-tags/${subgroupTagId}/variable-mappings/${variableId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to remove variable mapping: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error removing variable mapping:", error);
      throw error;
    }
  }
};
