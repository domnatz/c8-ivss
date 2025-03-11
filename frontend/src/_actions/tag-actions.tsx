"use server";

import { addTagToSubgroup } from "@/_services/subgroup-service";

export async function addTagToSubgroupAction(subgroupId: number, tagId: number, tagName: string) {
  try {
    const response = await addTagToSubgroup(subgroupId, { tag_id: tagId, tag_name: tagName });
    await response.json();
    return { success: true };
  } catch (error: any) {
    console.error("There was an error adding the tag to the subgroup!", error);
    return { success: false, error: error.message };
  }
}