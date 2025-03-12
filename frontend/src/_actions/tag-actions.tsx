"use server";

import { addTagToSubgroup } from "@/_services/subgroup-service";

export async function addTagToSubgroupAction(subgroupId: number, tagId: number, tagName: string) {
  try {
    const response = await addTagToSubgroup(subgroupId, { tag_id: tagId, tag_name: tagName });
    
    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.detail || errorText);
      } catch {
        throw new Error(errorText);
      }
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error: any) {
    console.error("There was an error adding the tag to the subgroup!", error);
    return { success: false, error: error.message };
  }
}