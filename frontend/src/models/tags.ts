import { Masterlist } from "./masterlist";

export interface Tags {
  tag_id: number;
  tag_name: string;
  description?: string;
  units?: string;
  file_id?: number;
  tag_type?: string;
  tag_data?: Record<string, unknown>;

  // Optional reference to the related masterlist (for when you need the whole object)
  masterlist?: Masterlist;
}
