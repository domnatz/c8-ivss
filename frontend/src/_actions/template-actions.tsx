import * as templateService from "@/_services/template-service";
import { Template, SaveTemplateParams } from "@/models/template";

/**
 * Save a template and return a simplified result
 */
export const saveTemplate = async (params: SaveTemplateParams): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("Action: saveTemplate", params);
    const template = await templateService.saveTemplate(params);
    console.log("Template saved:", template);
    
    // Use the template_name from the params as fallback if asset_name is undefined
    const templateName = template.asset_name || params.template_name;
    
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
