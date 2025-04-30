import * as React from "react";
import { formula_variables } from "@/models/formula_variable";
import { variable_mappings } from "@/models/variable_mappings";
import AssignSubgroupTagVariable from "../assign-subgroup_tag-variable";
import VariableMapping from "./VariableMapping";

interface VariablesListProps {
  variables: formula_variables[];
  mappings: Record<
    number,
    variable_mappings & { tag_name?: string; subgroup_tag_name?: string }
  >;
  onRemoveMapping: (variableId: number) => void;
  onAssignTag: () => Promise<void>;
}

const VariablesList: React.FC<VariablesListProps> = ({
  variables,
  mappings,
  onRemoveMapping,
  onAssignTag,
}) => {
  return (
    <div className="flex flex-col gap-2">
      {variables.map((variable, index) => (
        <div key={index} className="inline-flex w-full items-center gap-2">
          <div className="p-2 text-sm border border-border rounded-md bg-background font-medium w-fit">
            {variable.variable_name}
          </div>
          <span>=</span>
          {variable.variable_id && mappings[variable.variable_id] ? (
            <VariableMapping
              mapping={mappings[variable.variable_id]}
              onRemove={() =>
                variable.variable_id && onRemoveMapping(variable.variable_id)
              }
            />
          ) : (
            <AssignSubgroupTagVariable
              buttonText={`Assign tag to ${variable.variable_name}`}
              variableName={variable.variable_name}
              variableId={variable.variable_id}
              refreshChildTags={onAssignTag}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default VariablesList;
