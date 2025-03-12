"use client";

import { AdjustmentsVerticalIcon } from "@heroicons/react/24/outline";
import { SearchForm } from "@/components/user/search-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { filterOptions } from "@/_services/asset-service";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import { rootActions } from "@/app/_redux/root-slice";

interface FilterAssetsProps {
  className?: string;
}

export function FilterAssets({ className }: FilterAssetsProps) {
  const dispatch = useAppDispatch();
  const state = useAppSelector((state) => state.rootState);

  return (
    <div className={`flex flex-row w-full gap-2 ${className || ""}`}>
      <SearchForm
        className="w-full h-full"
        value={state.searchQuery}
        onInputChange={(e) =>
          dispatch(rootActions.searchQuerySet(e.target.value))
        }
      />

      <DropdownMenu>
        <DropdownMenuTrigger className="p-2">
          <AdjustmentsVerticalIcon className="w-5 h-5 text-zinc-500" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {filterOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onSelect={() => dispatch(rootActions.filterSet(option.value))}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
