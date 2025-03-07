// Add asset by calling backend API
export function addAsset({
  asset_name,
  asset_type,
}: {
  asset_name: string;
  asset_type: string;
}) {
  return fetch(`http://localhost:8000/assets`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      asset_name,
      asset_type,
    }),
  });
}

export const filterOptions = [
  { label: "Newest Added", value: "newest" },
  { label: "Oldest", value: "oldest" },
];

// Upload masterlist by calling backend API
export const uploadMasterlist = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return fetch(`http://localhost:8000/upload_masterlist`, {
    method: "POST",
    body: formData,
  });
};

// Add subgroup to asset by calling backend API
export const addSubgroup = (
  asset_id: number,
  subgroup_name = "New Subgroup"
) => {
  const payload = { subgroup_name };

  return fetch(`http://localhost:8000/assets/${asset_id}/subgroups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
};

// Rename subgroup by calling backend API
export const renameSubgroup = (subgroup_id: number, newName: string) => {
  return fetch(`http://localhost:8000/subgroups/${subgroup_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subgroup_name: newName,
    }),
  });
};

// Rename asset by calling backend API
export const renameAsset = (asset_id: number, newTitle: string) => {
  return fetch(`http://localhost:8000/assets/${asset_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      asset_name: newTitle,
    }),
  });
};

// Get all assets with their subgroups
export const getAssets = async () => {
  const response = await fetch(`http://localhost:8000/assets`);
  const data = await response.json();

  // Fetch subgroups for each asset
  const assetsWithSubgroups = await Promise.all(
    data.map(async (asset: any) => {
      try {
        const subgroupsResponse = await fetch(
          `http://localhost:8000/assets/${asset.asset_id}/subgroups`
        );
        if (subgroupsResponse.ok) {
          const subgroups = await subgroupsResponse.json();
          return {
            ...asset,
            subgroups: Array.isArray(subgroups) ? subgroups : [],
          };
        } else {
          return { ...asset, subgroups: [] };
        }
      } catch (error) {
        console.error(
          `Error fetching subgroups for asset ${asset.asset_id}:`,
          error
        );
        return { ...asset, subgroups: [] };
      }
    })
  );

  return assetsWithSubgroups;
};

// Get asset by ID with its subgroups
export const getAssetById = async (assetId: number) => {
  const response = await fetch(`http://localhost:8000/assets/${assetId}`);
  const asset = await response.json();

  const subgroupsResponse = await fetch(
    `http://localhost:8000/assets/${assetId}/subgroups`
  );

  if (subgroupsResponse.ok) {
    const subgroups = await subgroupsResponse.json();
    return {
      ...asset,
      subgroups: Array.isArray(subgroups) ? subgroups : [],
    };
  }

  return { ...asset, subgroups: [] };
};
