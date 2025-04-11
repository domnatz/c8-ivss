/**
 * Extract variables from a formula expression (variables prefixed with $)
 * @param expression The formula expression to parse
 * @returns Array of variable names (without $ prefix)
 */
export const extractVariables = (expression: string): string[] => {
  // Find all variables with $ prefix
  const regex = /\$([a-zA-Z_][a-zA-Z0-9_]*)/g;
  const matches = expression.match(regex);

  if (!matches) return [];

  // Remove $ prefix and return unique variable names
  const uniqueVars = Array.from(
    new Set(matches.map((match) => match.substring(1)))
  );

  return uniqueVars;
};