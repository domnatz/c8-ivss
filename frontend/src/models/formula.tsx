export interface Formula {
    formula_id?: number;
    formula_name: string;
    formula_desc?: string;
    formula_expression: string;
    num_parameters: number;
  }
  
  export interface Template {
    template_id?: number;
    formula_id: number;
    template_name: string;
  }
  
  // Parameter types that might be referenced in formulas
  export interface FormulaParameter {
    name: string;
    description?: string;
    type: 'number' | 'boolean' | 'string';
  }
  
  // Used to evaluate formula results
  export interface FormulaEvaluation {
    formula_id: number;
    parameters: Record<string, any>;
    result?: boolean | number | string;
    error?: string;
  }