import { AxiosInstance } from "axios";

import {
  Render,
  RenderableItem,
  RenderableItemDetails,
  RenderableItemsListOptions,
  RenderItemParams,
} from "./types";
import {
  getRenderableItemsDetails,
  renderItem,
  getRenderItem,
  listRenderableItems,
} from "./api";

export interface PlainlySdk {
  listRenderableItems: (
    options: RenderableItemsListOptions
  ) => Promise<RenderableItem[]>;
  getRenderableItemsDetails: (
    id: string,
    isDesign: boolean
  ) => Promise<RenderableItemDetails[]>;
  renderItem: (params: RenderItemParams) => Promise<Render>;
  getRenderItem: (renderingId: string) => Promise<Render>;
}

export default function PlainlySdk(apiClient: AxiosInstance): PlainlySdk {
  return {
    listRenderableItems: withClient(listRenderableItems, apiClient),
    getRenderableItemsDetails: withClient(getRenderableItemsDetails, apiClient),
    renderItem: withClient(renderItem, apiClient),
    getRenderItem: withClient(getRenderItem, apiClient),
  };
}

function withClient<T extends (...args: any[]) => any>(
  fn: (client: AxiosInstance, ...args: Parameters<T>) => ReturnType<T>,
  client: AxiosInstance
) {
  return (...args: Parameters<T>) => fn(client, ...args);
}
