import * as templateService from "@/_services/template-service";
import { Template } from "@/models/template";

/**
 * Save a template and return a simplified result
 */
export const saveTemplate = async (params: Template, contextTagId?: number): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("Action: saveTemplate", params, "Context Tag ID:", contextTagId);
    const template = await templateService.saveTemplate(params, contextTagId);
    console.log("Template saved:", template);
    
    // Use the template_name from the params as fallback if asset_name is undefined
    const templateName = template.template_name;
    
    return {
      success: true,
      message: `Template "${templateName}" saved successfully!`,
    };
  } catch (error) {
    console.error("Template save failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to save template";
    return {
      success: false,
      message: errorMessage,
    };
  }
};

/**
 * Get all templates
 */
export const getTemplates = async (): Promise<Template[]> => {
  try {
    return await templateService.getTemplates();
  } catch (error) {
    console.error("Failed to get templates:", error);
    throw error;
  }
};

/**
 * Delete a template by ID
 */
export const deleteTemplate = async (templateId: number): Promise<{ success: boolean; message: string }> => {
  try {
    console.log(`Action: deleteTemplate - Template ID: ${templateId}`);
    await templateService.deleteTemplate(templateId);
    return {
      success: true,
      message: "Template deleted successfully!"
    };
  } catch (error) {
    console.error("Template deletion failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to delete template";
    return {
      success: false,
      message: errorMessage
    };
  }
};

export const assignTemplate = async (
  templateId: number,
  subgroupTagId: number
): Promise<{ success: boolean; message: string; formula_id?: number }> => {
  try {
    console.log(`Action: assignTemplate - Template ID: ${templateId}, Tag ID: ${subgroupTagId}`);
    const result = await templateService.assignTemplateToSubgroupTag(templateId, subgroupTagId);
    console.log("Template assigned:", result);
    
    return {
      success: true,
      message: "Template applied successfully!",
      formula_id: result.formula_id
    };
  } catch (error) {
    console.error("Template assignment failed:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to apply template";
    return {
      success: false,
      message: errorMessage,
    };
  }
};