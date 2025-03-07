import { Masterlist } from "./masterlist";

export interface Tags {
  tag_id: number;
  file_id: Masterlist; // Foreign key referencing Masterlist.file_id
  tag_type: "classified" | "unclassified"; // Classification field
  tag_name: string;
  tag_data?: Record<string, unknown>; // JSON data type
}
