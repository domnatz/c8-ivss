// Define a fallback URL to use if environment variable isn't set
const BASE_URL = process.env.BASE_URL || "http://localhost:8000/api";

export async function fetchMasterlist() {
  const response = await fetch(`${BASE_URL}/masterlist/latest`); // Correct endpoint
  if (!response.ok) {
    throw new Error(`Failed to fetch masterlist: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchMasterlistByFileId(file_id: number) {
  const response = await fetch(`${BASE_URL}/masterlist/${file_id}`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch masterlist by file ID: ${response.statusText}`
    );
  }
  return response.json();
}

export async function uploadMasterlistFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/upload_masterlist`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    return { success: false, error: response.statusText };
  }

  return { success: true, data: await response.json() };
}

// Fetch all masterlist files
export async function fetchAllMasterlists() {
  const response = await fetch(`${BASE_URL}/masterlists`);
  if (!response.ok) {
    throw new Error(`Failed to fetch all masterlists: ${response.statusText}`);
  }
  return response.json();
}
