import Header from "./_section/header";

export default function Layout({ children }: { children: React.ReactNode }) {
  const assetId = "assetId";

  return (
    <div className="flex flex-col px-6 py-4 w-full h-full">
      <Header assetId={assetId} />
      {children}
    </div>
  );
}
