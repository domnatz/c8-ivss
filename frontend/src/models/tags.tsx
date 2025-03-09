import { Masterlist } from "./masterlist";

export interface Tags {
  tag_id: number;
  file_id: number; // Foreign key referencing Masterlist.file_id
  tag_type: "classified" | "unclassified"; // Classification field
  tag_name: string;
  tag_data?: Record<string, unknown>; // JSON data type

  // Optional reference to the related masterlist (for when you need the whole object)
  masterlist?: Masterlist;
}
