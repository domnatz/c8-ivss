import * as React from "react";
import { TagIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { variable_mappings } from "@/models/variable_mappings";
import { getTagNameFromMapping } from "@/utils/tag-utils";

interface VariableMappingProps {
  mapping: variable_mappings & {
    tag_name?: string;
    subgroup_tag_name?: string;
  };
  onRemove: () => void;
}

const VariableMapping: React.FC<VariableMappingProps> = ({
  mapping,
  onRemove,
}) => (
  <div className="flex items-center gap-2 p-2 text-sm border border-blue-200 rounded-md bg-blue-50 text-blue-700 flex-grow min-w-0">
    <TagIcon className="w-4 h-4 flex-shrink-0" />
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex-grow truncate overflow-hidden text-ellipsis">
            {getTagNameFromMapping(mapping)}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTagNameFromMapping(mapping)}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
    <button
      onClick={onRemove}
      className="p-1 hover:bg-blue-100 rounded-full cursor-pointer flex-shrink-0"
    >
      <XMarkIcon className="w-4 h-4 text-blue-700" />
    </button>
  </div>
);

export default VariableMapping;
