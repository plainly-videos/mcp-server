import { createAxiosInstance } from "../axiosConfig";
import { getAspectRatio } from "../utils/aspectRatio";
import { Design, Project, RenderableItem } from "./types";

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
      metadata: { category: design.category },
      templates: design.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        aspectRatio: variant.aspectRatio,
        duration: variant.duration,
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
      metadata: { attributes: project.attributes },
      templates: project.templates.map((template) => ({
        id: template.id,
        name: template.name,
        aspectRatio: getAspectRatio(
          template.resolution.width,
          template.resolution.height
        ),
        duration: template.duration,
      })),
    }));
};

export const listRenderableItems = async (): Promise<RenderableItem[]> => {
  const [designs, projects] = await Promise.all([
    listRenderableDesigns(),
    listRenderableProjects(),
  ]);

  return [...designs, ...projects];
};
