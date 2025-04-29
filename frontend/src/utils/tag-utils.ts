/**
 * Safely extracts tag name from a mapping object with inconsistent structure
 * @param mapping The mapping object containing tag information
 * @returns The tag name as a string
 */
export const getTagNameFromMapping = (mapping: any): string => {
  if (!mapping) return "Unknown Tag";

  return (
    mapping.mapped_tag_name ||
    mapping.assigned_tag?.subgroup_tag_name ||
    mapping.tag_name ||
    mapping.subgroup_tag_name ||
    mapping.name ||
    "Assigned Tag"
  );
};
