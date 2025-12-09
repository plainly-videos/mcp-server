import type { AxiosInstance } from "axios";
import { getAspectRatio } from "../../utils/aspectRatio";
import type { Design, Project, RenderableItem, RenderableItemsListOptions } from "../types";

export const listRenderableItems = async (
  client: AxiosInstance,
  options: RenderableItemsListOptions = {
    excludeDesigns: false,
    excludeProjects: false,
  },
): Promise<RenderableItem[]> => {
  const designs = options.excludeDesigns ? [] : await listRenderableDesigns(client);
  const projects = options.excludeProjects ? [] : await listRenderableProjects(client);

  return [...projects, ...designs];
};

const listRenderableDesigns = async (client: AxiosInstance): Promise<RenderableItem[]> => {
  const response = await client.get<Design[]>("/api/v2/designs");

  return response.data
    .filter((design) => !design.renderUiDisabled)
    .map((design) => ({
      isDesign: true,
      id: design.id,
      name: design.name,
      description: design.description,
      metadata: { category: design.category || null, attributes: null },
      templates: design.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        aspectRatio: variant.aspectRatio,
        durationSeconds: variant.duration,
      })),
    }));
};

const listRenderableProjects = async (client: AxiosInstance): Promise<RenderableItem[]> => {
  const response = await client.get<Project[]>("/api/v2/projects");

  return response.data
    .filter((project) => project.analyzed && project.templates.length > 0)
    .map((project) => ({
      isDesign: false,
      id: project.id,
      name: project.name,
      description: project.description,
      metadata: { category: null, attributes: project.attributes || null },
      templates: project.templates.map((template) => ({
        id: template.id,
        name: template.name,
        aspectRatio: getAspectRatio(template.resolution.width, template.resolution.height),
        durationSeconds: template.duration,
      })),
    }));
};
