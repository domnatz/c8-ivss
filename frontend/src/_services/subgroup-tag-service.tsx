import { Subgroup_tag } from "@/models/subgroup-tag";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function addTagToSubgroup(
  subgroupId: number,
  tagId: number,
  tagName: string,
  parentSubgroupTagId?: number
): Promise<Subgroup_tag> {
  const response = await fetch(`${API_URL}/api/subgroups/${subgroupId}/tags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tag_id: tagId,
      tag_name: tagName,
      parent_subgroup_tag_id: parentSubgroupTagId || null,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to add tag to subgroup");
  }

  return response.json();
}

export async function getSubgroupTags(subgroupId: number): Promise<Subgroup_tag[]> {
  const response = await fetch(`${API_URL}/api/subgroups/${subgroupId}/tags`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch subgroup tags");
  }

  return response.json();
}
