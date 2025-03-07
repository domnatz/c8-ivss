// "use client";

// import * as React from "react";
// // ...other imports...
// import { toast } from "react-toastify";
// import { TagDetails, Tags } from "./tagsDetails";
// import { Asset } from "@/models/asset";
// import { Subgroup } from "@/models/subgroup";
// import { Subgroup_tag } from "@/models/subgroup-tag";
// import { getAssetById } from "@/_services/asset-service";

// export default function SubgroupTagEdit() {
//   const [searchQuery, setSearchQuery] = React.useState("");
//   const [selectedSubgroup, setSelectedSubgroup] = React.useState<Subgroup | null>(null);
//   const [asset, setAsset] = React.useState<Asset | null>(null);
//   const [sortOrder, setSortOrder] = React.useState<"newest" | "oldest">("newest");
//   const [loading, setLoading, setLoading] = React.useState(true);
//   const [dialogOpen, setDialogOpen] = React.useState(false);
//   const params = useParams();
//   const assetId = Number(params.assetId);

//   // Fetch asset data when component mounts
//   React.useEffect(() => {
//     const fetchAsset = async () => {
//       try {
//         setLoading(true);
//         if (!assetId) return;

//         const assetData = await getAssetById(assetId);
//         setAsset(assetData);

//         // Auto-select the first subgroup if available
//         if (assetData.subgroups && assetData.subgroups.length > 0) {
//           setSelectedSubgroup(assetData.subgroups[0]);
//         }
//       } catch (error) {
//         console.error("Error fetching asset:", error);
//         toast.error("Failed to load asset details");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAsset();
//   }, [assetId]);

//   // Filter and sort tags based on searchQuery and sortOrder for the selected subgroup
//   const filteredTags = selectedSubgroup
//     ? (selectedSubgroup.subgroup_tags ?? [])
//         .filter((tag) =>
//           tag.subgroup_tag_name
//             .toLowerCase()
//             .includes(searchQuery.toLowerCase())
//         )
//         .sort((a, b) =>
//           sortOrder === "newest"
//             ? b.subgroup_tag_id - a.subgroup_tag_id
//             : a.subgroup_tag_id - b.subgroup_tag_id
//         )
//     : [];

//   // Function to handle adding a tag to the selected subgroup
//   const handleAddTag = (tag: Tags) => {
//     if (selectedSubgroup && asset) {
//       // ...existing implementation...

//       toast.success(`Added "${tag.tag_name}" to ${selectedSubgroup.subgroup_name}`);
//     }
//   };

//   // Function to handle removing a tag from the selected subgroup
//   const handleRemoveTag = (tagId: number) => {
//     if (!selectedSubgroup || !asset) return;

//     // ...existing implementation...

//     toast.success("Tag was removed from the subgroup");
//   };

//   const handleSaveTemplate = () => {
//     toast.success("Your tag template has been saved");
//     setDialogOpen(false);
//   };

//   // ...existing return statement...
// }
