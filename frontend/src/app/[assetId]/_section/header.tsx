import { CubeIcon } from "@heroicons/react/24/outline";
import BreadcrumbNav from "./BreadcrumbNav";
import { Label } from "@/components/ui/label";

export default function Header({ assetId }: { assetId: string }) {
  return (
    <div>
      <div className="flex flex-col gap-2 w-full h-full">
        <span className="flex flex-row gap-1 font-medium items-center">
          <CubeIcon className="w-5 h-5" />
          {assetId}
        </span>
        <span className="flex flex-col gap-2">
          <BreadcrumbNav />
          <Label
            htmlFor="subgroupsEdit"
            className="flex flex-col gap-1 justify-start text-left mt-2 w-full"
          >
            <span className="justify-start text-left flex flex-row w-full">
              Subgroups
            </span>
            <span className="text-xs font-normal text-zinc-500 flex justify-start text-left w-full">
              Please select a subgroup to edit
            </span>
          </Label>
        </span>
      </div>
    </div>
  );
}
