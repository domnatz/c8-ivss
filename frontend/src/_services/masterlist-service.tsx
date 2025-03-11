export async function fetchMasterlist() {
  const response = await fetch(`http://localhost:8000/masterlist/latest`); // Correct endpoint
  if (!response.ok) {
    throw new Error(`Failed to fetch masterlist: ${response.statusText}`);
  }
  return response.json();
}

export async function fetchMasterlistByFileId(file_id: number) {
  const response = await fetch(`http://localhost:8000/masterlist/${file_id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch masterlist by file ID: ${response.statusText}`);
  }
  return response.json();
}

export async function uploadMasterlistFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:8000/upload_masterlist", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    return { success: false, error: response.statusText };
  }

  return { success: true, data: await response.json() };
}