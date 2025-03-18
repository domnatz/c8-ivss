"use server";

import { addTagToSubgroup as addTagToSubgroupService } from "@/_services/subgroup-tag-service";
import { Subgroup_tag } from "@/models/subgroup-tag";

export async function addTagToSubgroup(
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