import { createSubgroup } from "./asset-actions";
import { getAssetById } from "@/_services/asset-service";
import { addTagToSubgroup, deleteSubgroup } from "@/_services/subgroup-service";
import { Subgroup_tag } from "@/models/subgroup-tag";

interface ActionResult<T = any> {
  success: boolean;
  error?: string;
  data?: T;
}

export async function addSubgroupAction(assetId: number): Promise<ActionResult> {
  try {
    const result = await createSubgroup(assetId);
    if (result.success) {
      // Refresh asset data
      const updatedAsset = await getAssetById(assetId);
      return { 
        success: true, 
        data: updatedAsset 
      };
    } else {
      return { 
        success: false, 
        error: result.error || "An error occurred" 
      };
    }
  } catch (error) {
    console.error("Error creating subgroup:", error);
    return { 
      success: false, 
      error: "Failed to create subgroup" 
    };
  }
}

export async function addTagToSubgroupAction(
  subgroupId: number,
  tagId: number,
  tagName: string
): Promise<ActionResult<Subgroup_tag>> {
  try {
    const response = await addTagToSubgroup(subgroupId, { 
      tag_id: tagId, 
      tag_name: tagName 
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: {
          subgroup_tag_id: data.subgroup_tag_id,
          tag_id: tagId,
          subgroup_id: subgroupId,
          subgroup_tag_name: tagName,
          parent_subgroup_tag_id: null,
        }
      };
    } else {
      const errorText = await response.text();
      return { 
        success: false, 
        error: `Failed to add tag: ${errorText}` 
      };
    }
  } catch (error) {
    console.error("Error adding tag:", error);
    return { 
      success: false, 
      error: "Failed to add tag to subgroup" 
    };
  }
}

export async function deleteSubgroupAction(
  subgroupId: number
): Promise<ActionResult> {
  try {
    const response = await deleteSubgroup(subgroupId);
    
    if (response.ok) {
      return {
        success: true,
      };
    } else {
      const errorText = await response.text();
      return { 
        success: false, 
        error: `Failed to delete subgroup: ${errorText}` 
      };
    }
  } catch (error) {
    console.error("Error deleting subgroup:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete subgroup" 
    };
  }
}
