"use client";

import { Asset } from "@/models/asset";
import { CubeIcon } from "@heroicons/react/24/outline";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import SubgroupEdit from "./SubgroupEdit";
import SubgroupTagEdit from "./SubgroupTagEdit";
import { getAssetById } from "@/_services/asset-service";
import { Subgroup_tag } from "@/models/subgroup-tag"; // Import Subgroup_tag

export default function AssetDetails() {
  const params = useParams();

  // Get the raw param value for debugging
  const rawId = params.id;
  // Make sure we're using the correct parameter name and properly convert to number
  const numericAssetId = typeof rawId === "string" ? parseInt(rawId, 10) : NaN;

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubgroupTag, setSelectedSubgroupTag] =
    useState<Subgroup_tag | null>(null); // Add state for selected subgroup tag

  useEffect(() => {
    // Log the raw and parsed values for debugging
    console.log("Raw ID param:", rawId);
    console.log("Parsed numeric asset ID:", numericAssetId);

    if (!numericAssetId || isNaN(numericAssetId)) {
      setError(`Invalid asset ID: ${rawId}`);
      setLoading(false);
      return;
    }

    const fetchAssetDetails = async () => {
      try {
        setLoading(true);
        const asset = await getAssetById(numericAssetId);
        setSelectedAsset(asset);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching asset details:", err);
        // Provide more detailed error message
        setError(err?.message || "Failed to load asset details");
        setSelectedAsset(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAssetDetails();
  }, [rawId, numericAssetId]);

  if (loading) {
    return <div>Loading asset details...</div>;
  }

  if (error || !selectedAsset) {
    return (
      <div className="py-4 w-full h-full">
        <div className="flex flex-col gap-2 w-full h-full">
          <span className="flex flex-row gap-1 font-medium items-center">
            <CubeIcon className="w-5 h-5" />
            {error || "Asset Not Found"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 w-full h-full">
      <div className="flex flex-col sm:flex-row gap-4 grid-cols-2 h-full">
        <SubgroupEdit
          selectedAsset={selectedAsset}
          onSelectSubgroupTag={setSelectedSubgroupTag} // Pass the setter function
        />
        <SubgroupTagEdit selectedSubgroupTag={selectedSubgroupTag} />{" "}
        {/* Pass the selected subgroup tag */}
      </div>
    </div>
  );
}
