import type { AxiosInstance } from "axios";
import { getRenderableItemsDetails, getRenderItem, listRenderableItems, renderItem } from "./api";
import type {
  Render,
  RenderableItem,
  RenderableItemDetails,
  RenderableItemsListOptions,
  RenderItemParams,
} from "./types";

export * from "./types";

export interface PlainlySdk {
  listRenderableItems: (options: RenderableItemsListOptions) => Promise<RenderableItem[]>;
  getRenderableItemsDetails: (id: string, isDesign: boolean) => Promise<RenderableItemDetails[]>;
  renderItem: (params: RenderItemParams) => Promise<Render>;
  getRenderItem: (renderingId: string) => Promise<Render>;
}

export default function createPlainlyClient(apiClient: AxiosInstance): PlainlySdk {
  return {
    listRenderableItems: withClient(listRenderableItems, apiClient),
    getRenderableItemsDetails: withClient(getRenderableItemsDetails, apiClient),
    renderItem: withClient(renderItem, apiClient),
    getRenderItem: withClient(getRenderItem, apiClient),
  };
}

function withClient<A extends unknown[], R>(fn: (client: AxiosInstance, ...args: A) => R, client: AxiosInstance) {
  return (...args: A): R => fn(client, ...args);
}
