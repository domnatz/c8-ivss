/**
 * Template Service
 * Handles all API calls related to templates
 */
import { Template } from "@/models/template";

// Base API URL
const API_URL = "http://localhost:8000/api";

/**
 * Save a new template
 */
export const saveTemplate = async (
  params: Template
): Promise<Template> => {
  console.log("API call: saveTemplate", params);

  const response = await fetch(`${API_URL}/templates`, {
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
