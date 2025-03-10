"use server";

import {
  addAsset,
  addSubgroup,
  renameAsset,
  renameSubgroup,
  uploadMasterlist,
} from "@/_services/asset-service";
import { fetchMasterlist, fetchMasterlistByFileId } from "@/_services/masterlist-service"; // Import fetchMasterlist
import { revalidatePath } from "next/cache";

export async function createAsset(_prevState: any = null) {
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

export async function createSubgroup(assetId: number, _prevState: any = null) {
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

export async function updateAssetName(
  { assetId, newName }: { assetId: number; newName: string },
  _prevState: any = null
) {
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
  {
    assetId,
    subgroupId,
    newName,
  }: { assetId: number; subgroupId: number; newName: string },
  _prevState: any = null
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

export async function uploadMasterlistFile(file: File, _prevState: any = null) {
  try {
    if (!file) {
      return { success: false, error: "No file provided" };
    }
    const response = await uploadMasterlist(file);
    await response.json();
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("There was an error uploading the masterlist!", error);
    return { success: false, error: error.message };
  }
}

/// Fetch masterlist action
export async function getMasterlist(fileId?: number) {
  try {
    const masterlist = fileId ? await fetchMasterlistByFileId(fileId) : await fetchMasterlist(); // Fetch latest if no fileId
    return { success: true, data: masterlist };
  } catch (error: any) {
    console.error("There was an error fetching the masterlist!", error);
    return { success: false, error: error.message };
  }
}