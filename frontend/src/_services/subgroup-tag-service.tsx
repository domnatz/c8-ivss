import { Subgroup_tag } from "@/models/subgroup-tag";

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

export async function addTagToSubgroupTag(
  subgroupId: number,
  tagId: number,
  tagName: string,
  parentSubgroupTagId?: number
): Promise<Subgroup_tag> {
  const response = await fetch(`${BASE_URL}/api/subgroups/${subgroupId}/tags`, {
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
  const response = await fetch(`${BASE_URL}/api/subgroups/${subgroupId}/tags`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch subgroup tags");
  }

  return response.json();
}

export async function getChildTagsByParentId(parentTagId: number): Promise<Subgroup_tag[]> {
  const response = await fetch(`${BASE_URL}/api/subgroups/${parentTagId}/children_tags`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Failed to fetch child tags");
  }

  return response.json();
}

export async function updateSubgroupTagFormula(subgroupTagId: number, formulaId: number) {
  console.log(`Making API request to: ${BASE_URL}/api/subgroups/${subgroupTagId}/formula`, {
    method: 'PUT',
    body: JSON.stringify({ formula_id: formulaId }),
  });

  const response = await fetch(`${BASE_URL}/api/subgroups/${subgroupTagId}/formula`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ formula_id: formulaId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response from API:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`Failed to update subgroup tag formula: ${errorText}`);
  }
  
  // Log successful update
  console.log('Successfully updated formula for subgroup tag:', subgroupTagId);
  return response.json();
}

