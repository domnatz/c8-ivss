"use server";

import { addTagToSubgroupTag as addTagToSubgroupService, updateSubgroupTagFormula as updateSubgroupTagFormulaService } from "@/_services/subgroup-tag-service";
import { Subgroup_tag } from "@/models/subgroup-tag";

export async function addTagToSubgroupTag(
  subgroupId: number,
  tagId: number,
  tagName: string,
  parentSubgroupTagId?: number
): Promise<{ success: boolean; data?: Subgroup_tag; error?: string }> {
  try {
    const data = await addTagToSubgroupService(subgroupId, tagId, tagName, parentSubgroupTagId);
    return { success: true, data };
  } catch (error: any) {
    console.error("Error adding tag to subgroup:", error);
    return { success: false, error: error.message };
  }
}

export async function updateSubgroupTagFormula(subgroupTagId: number, formulaId: number) {
  try {
    await updateSubgroupTagFormulaService(subgroupTagId, formulaId);
  } catch (error) {
    console.error("Error updating subgroup tag formula:", error);
  }
}