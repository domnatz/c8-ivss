import { Subgroup_tag } from './subgroup-tag';

export type Subgroup = {
  subgroup_id: number;
  subgroup_name: string;
  subgroup_tags?: Subgroup_tag[]; // Optional property
};
