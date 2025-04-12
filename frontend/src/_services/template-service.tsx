/**
 * Template Service
 * Handles all API calls related to templates
 */
import { Template } from "@/models/template";
import { revalidateTag } from "next/cache";

// Base API URL
const API_URL = "http://localhost:8000/api";

/**
 * Save a new template
 */
export const saveTemplate = async (
  params: Template,
  contextTagId?: number
): Promise<Template> => {
  console.log("API call: saveTemplate", params, "Context Tag ID:", contextTagId);

  // Create URL with optional context_tag_id parameter
  let url = `${API_URL}/templates`;
  if (contextTagId) {
    url += `?context_tag_id=${contextTagId}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  console.log("API response:", data);

  if (!response.ok) {
    throw new Error(data.detail || "Failed to save template");
  }

  return data;
};

/**
 * Get all templates
 */
export const getTemplates = async (): Promise<Template[]> => {
  const response = await fetch(`${API_URL}/templates`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Failed to retrieve templates");
  }

  return data;
};

/**
 * Delete a template by ID
 */
export const deleteTemplate = async (templateId: number): Promise<any> => {
  console.log(`API call: deleteTemplate - Template ID: ${templateId}`);
  
  const response = await fetch(`${API_URL}/templates/${templateId}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.detail || `Failed to delete template with ID: ${templateId}`);
  }
  
  return { success: true };
};

export const assignTemplateToSubgroupTag = async (
  templateId: number,
  subgroupTagId: number
): Promise<any> => {
  console.log(`API call: assignTemplateToSubgroupTag - Template ID: ${templateId}, Tag ID: ${subgroupTagId}`);

  const response = await fetch(`${API_URL}/subgroup-tags/assign-template`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      template_id: templateId,
      subgroup_tag_id: subgroupTagId,
    }),
    next: { tags: ["subgroup_tags"] }, // Revalidate the cache for this tag
  });

  const data = await response.json();
  console.log("API response:", data);
  
  if (!response.ok) {
    throw new Error(data.detail || "Failed to assign template");
  }

  return data;
};