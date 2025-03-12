"use server";

import {
  fetchMasterlist,
  fetchMasterlistByFileId,
  fetchAllMasterlists,
  uploadMasterlistFile,
} from "@/_services/masterlist-service";

export async function getLatestMasterlist() {
  try {
    const data = await fetchMasterlist();
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching latest masterlist:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getMasterlistByFileId(fileId: number) {
  try {
    const data = await fetchMasterlistByFileId(fileId);
    return { success: true, data };
  } catch (error) {
    console.error(`Error fetching masterlist with file ID ${fileId}:`, error);
    return { success: false, error: (error as Error).message };
  }
}

export async function getAllMasterlists() {
  try {
    const data = await fetchAllMasterlists();
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching all masterlists:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function uploadMasterlist(file: File) {
  try {
    const result = await uploadMasterlistFile(file);
    return result;
  } catch (error) {
    console.error("Error uploading masterlist:", error);
    return { success: false, error: (error as Error).message };
  }
}
