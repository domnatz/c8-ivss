import { Subgroup_tag } from "@/models/subgroup-tag"; // Import Subgroup_tag type

export function addTagToSubgroup(
  subgroupId: number,
  tagData: { tag_id: number; tag_name: string }
) {
  return fetch(`http://localhost:8000/subgroups/${subgroupId}/tags`, {
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

export async function fetchTagsBySubgroupId(subgroupId: number): Promise<Subgroup_tag[]> {
  const response = await fetch(`http://localhost:8000/subgroups/${subgroupId}/tags`);
  if (response.ok) {
    const data = await response.json();
    return data as Subgroup_tag[];
  } else {
    throw new Error('Failed to fetch tags');
  }
}