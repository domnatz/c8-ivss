import { Subgroup_tag } from "@/models/subgroup-tag"; // Import Subgroup_tag type

// Define a fallback URL to use if environment variable isn't set
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export function addTagToSubgroup(
  subgroupId: number,
  tagData: { tag_id: number; tag_name: string }
) {
  return fetch(`${BASE_URL}/subgroups/${subgroupId}/tags`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tag_id: tagData.tag_id,
      tag_name: tagData.tag_name,
    }),
  });
}

export async function fetchTagsBySubgroupId(
  subgroupId: number
): Promise<Subgroup_tag[]> {
  const response = await fetch(`${BASE_URL}/subgroups/${subgroupId}/tags`);
  if (response.ok) {
    const data = await response.json();
    return data as Subgroup_tag[];
  } else {
    const errorText = await response.text(); // Get error text from response
    throw new Error(`Failed to fetch tags: ${errorText}`); // Include error text in the error message
  }
}

export async function deleteSubgroup(subgroupId: number) {
  const response = await fetch(`${BASE_URL}/subgroups/${subgroupId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete subgroup: ${errorText}`);
  }
  
  return response;
}
