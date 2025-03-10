import { Tags } from "./tags";

export interface Masterlist {
  file_id: number;
  file_name: string;
  tags?: Tags[];
}