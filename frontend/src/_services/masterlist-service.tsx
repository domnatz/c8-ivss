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