"use server";

import {
  addAsset,
  addSubgroup,
  renameAsset,
  renameSubgroup,
  uploadMasterlist,
} from "@/_services/asset-service";
import { revalidatePath } from "next/cache";

export async function createAsset() {
  const asset_name = "New Asset";
  const asset_type = "Unclassified";

  try {
    const response = await addAsset({ asset_name, asset_type });
    await response.json();
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("There was an error adding the asset!", error);
    return { success: false, error: error.message };
  }
}

export async function createSubgroup(assetId: number) {
  try {
    const response = await addSubgroup(assetId);
    await response.json();
    revalidatePath(`/${assetId}`);
    return { success: true };
  } catch (error: any) {
    console.error("There was an error adding the subgroup!", error);
    return { success: false, error: error.message };
  }
}

export async function updateAssetName(assetId: number, newName: string) {
  try {
    const response = await renameAsset(assetId, newName);
    await response.json();
    revalidatePath(`/${assetId}`);
    return { success: true };
  } catch (error: any) {
    console.error("There was an error renaming the asset!", error);
    return { success: false, error: error.message };
  }
}

export async function updateSubgroupName(
  assetId: number,
  subgroupId: number,
  newName: string
) {
  try {
    const response = await renameSubgroup(subgroupId, newName);
    await response.json();
    revalidatePath(`/${assetId}`);
    return { success: true };
  } catch (error: any) {
    console.error("There was an error renaming the subgroup!", error);
    return { success: false, error: error.message };
  }
}

export async function uploadMasterlistFile(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const response = await uploadMasterlist(file);
    await response.json();
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("There was an error uploading the masterlist!", error);
    return { success: false, error: error.message };
  }
}
