import { createAxiosInstance } from "../../axiosConfig";
import { getAspectRatio } from "../../utils/aspectRatio";
import { Design, Project, RenderableItem } from "../types";

const api = createAxiosInstance();

const listRenderableDesigns = async (): Promise<RenderableItem[]> => {
  const response = await api.get<Design[]>("/api/v2/designs");

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

const listRenderableProjects = async (): Promise<RenderableItem[]> => {
  const response = await api.get<Project[]>("/api/v2/projects");

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
        aspectRatio: getAspectRatio(
          template.resolution.width,
          template.resolution.height
        ),
        durationSeconds: template.duration,
      })),
    }));
};

type ListOptions = {
  excludeDesigns?: boolean;
  excludeProjects?: boolean;
};

export const listRenderableItems = async (
  options: ListOptions = {
    excludeDesigns: false,
    excludeProjects: false,
  }
): Promise<RenderableItem[]> => {
  const designs = options.excludeDesigns ? [] : await listRenderableDesigns();
  const projects = options.excludeProjects
    ? []
    : await listRenderableProjects();

  return [...projects, ...designs];
};
