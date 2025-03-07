// Add tag to subgroup
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
      subgroup_tag_name: tagData.tag_name,
    }),
  });
}

// Remove tag from subgroup
export function removeTagFromSubgroup(subgroupTagId: number) {
  return fetch(`http://localhost:8000/subgroup_tags/${subgroupTagId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// Get all tags (for tag selection)
export async function getAllTags() {
  const response = await fetch(`http://localhost:8000/tags`);
  return response.json();
}

// Get subgroup details with tags
export async function getSubgroupWithTags(subgroupId: number) {
  const response = await fetch(`http://localhost:8000/subgroups/${subgroupId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch subgroup: ${response.statusText}`);
  }

  const subgroup = await response.json();

  // Fetch subgroup tags
  const tagsResponse = await fetch(
    `http://localhost:8000/subgroups/${subgroupId}/tags`
  );
  if (tagsResponse.ok) {
    const tags = await tagsResponse.json();
    return {
      ...subgroup,
      subgroup_tags: Array.isArray(tags) ? tags : [],
    };
  }

  return {
    ...subgroup,
    subgroup_tags: [],
  };
}

// Save tag template
export function saveTagTemplate(templateData: {
  template_name: string;
  tags: number[];
}) {
  return fetch(`http://localhost:8000/tag_templates`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(templateData),
  });
}
