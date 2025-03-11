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