import { Design, DesignRenderDto, DestructedRender, DesignDetails } from './types/design.js';

export interface PlainlySdkConfig {
  apiKey?: string;
  baseUrl?: string;
}

export class PlainlyApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = 'PlainlyApiError';
  }
}

export class PlainlySdk {
  private apiKey: string;
  private baseUrl: string;

  constructor(config?: PlainlySdkConfig) {
    this.apiKey = config?.apiKey || process.env.PLAINLY_API_KEY || '';
    this.baseUrl = config?.baseUrl || process.env.PLAINLY_API_URL || 'https://api.plainlyvideos.com';
    
    if (!this.apiKey) {
      throw new Error('API key is required. Set PLAINLY_API_KEY environment variable or provide it in config.');
    }
  }

  private getAuthHeaders(): Record<string, string> {
    return {
      'Authorization': `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      let error: any;
      try {
        error = await response.json();
      } catch {
        error = {
          status: response.status,
          message: response.statusText,
        };
      }
      throw new PlainlyApiError(
        error.message || `API request failed with status ${response.status}`,
        response.status,
        error
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * List all available designs (filtered to only enabled designs)
   * @returns Array of enabled designs
   */
  async listDesigns(): Promise<Design[]> {
    const designs = await this.request<Design[]>('/api/v2/designs', {
      method: 'GET',
    });
    
    // Filter out designs where renderUiDisabled is true
    return designs.filter(design => !design.renderUiDisabled);
  }

  /**
   * Get a single design by ID (only if not disabled)
   * @param designId The ID of the design
   * @returns The design details
   */
  async getDesign(designId: string): Promise<Design> {
    const design = await this.request<Design>(`/api/v2/designs/${designId}`, {
      method: 'GET',
    });
    
    if (design.renderUiDisabled) {
      throw new PlainlyApiError('Design is not available for rendering', 404);
    }
    
    return design;
  }

  /**
   * Get comprehensive design details by ID with variants, parameters, and examples
   * @param designId The ID of the design
   * @returns The comprehensive design details
   */
  async getDesignDetails(designId: string): Promise<DesignDetails> {
    const design = await this.request<DesignDetails>(`/api/v2/designs/${designId}`, {
      method: 'GET',
    });
    
    if (design.renderUiDisabled) {
      throw new PlainlyApiError('Design is not available for rendering', 404);
    }
    
    return design;
  }

  /**
   * Render a design
   * @param renderData The render configuration
   * @returns The render details
   */
  async renderDesign(renderData: DesignRenderDto): Promise<DestructedRender> {
    return this.request<DestructedRender>('/api/v2/designs', {
      method: 'POST',
      body: JSON.stringify(renderData),
    });
  }
}