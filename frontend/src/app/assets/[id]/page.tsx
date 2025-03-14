import AssetDetails from "./_section/asset-details";

export default async function Page({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  return <AssetDetails params={id} />;
}
