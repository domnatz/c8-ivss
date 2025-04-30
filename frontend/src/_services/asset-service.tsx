// Define a fallback URL to use if environment variable isn't set
const BASE_URL = process.env.BASE_URL || "http://localhost:8000/api";

// Add asset by calling backend API
export function addAsset({
  asset_name,
  asset_type,
}: {
  asset_name: string;
  asset_type: string;
}) {
  return fetch(`${BASE_URL}/assets`, {
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

  return fetch(`${BASE_URL}/upload_masterlist`, {
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

  return fetch(`${BASE_URL}/assets/${asset_id}/subgroups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    next: { tags: ["subgroups"] },
  });
};

// Rename subgroup by calling backend API
export const renameSubgroup = (subgroup_id: number, newName: string) => {
  return fetch(`${BASE_URL}/subgroups/${subgroup_id}`, {
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
  return fetch(`${BASE_URL}/assets/${asset_id}`, {
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
  const response = await fetch(`${BASE_URL}/assets`);
  const data = await response.json();

  // Fetch subgroups for each asset
  const assetsWithSubgroups = await Promise.all(
    data.map(async (asset: any) => {
      try {
        const subgroupsResponse = await fetch(
          `${BASE_URL}/assets/${asset.asset_id}/subgroups`
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
  // Add logging to debug the asset ID and URL being used
  console.log(
    `Fetching asset with ID: ${assetId} from ${BASE_URL}/assets/${assetId}`
  );

  // Check if assetId is valid before making the request
  if (!assetId || isNaN(assetId)) {
    throw new Error("Invalid asset ID provided");
  }

  try {
    const response = await fetch(`${BASE_URL}/assets/${assetId}`);

    // Log response status for debugging
    console.log(`Asset fetch response status: ${response.status}`);

    if (!response.ok) {
      // Try to get the error message from the response if possible
      const errorText = await response.text();
      console.error(`Asset fetch error response: ${errorText}`);
      throw new Error(
        `Failed to fetch asset: ${response.statusText}. Asset ID: ${assetId}`
      );
    }

    const asset = await response.json();
    console.log("Asset data received:", asset);

    // Fetch subgroups
    const subgroupsResponse = await fetch(
      `${BASE_URL}/assets/${assetId}/subgroups`
    );

    if (subgroupsResponse.ok) {
      const subgroups = await subgroupsResponse.json();
      return {
        ...asset,
        subgroups: Array.isArray(subgroups) ? subgroups : [],
      };
    }

    return { ...asset, subgroups: [] };
  } catch (error) {
    console.error(`Error in getAssetById: ${error}`);
    throw error;
  }
};
