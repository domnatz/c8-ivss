export interface Subgroup_tag {
  subgroup_tag_id: number;
  tag_id: number; // Foreign key from tag table
  subgroup_id: number; // Foreign key from subgroup table
  subgroup_tag_name: string; // Name of the tag in the subgroup
};