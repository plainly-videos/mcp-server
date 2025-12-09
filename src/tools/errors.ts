export class PlainlyMcpServerError extends Error {
  readonly solution: string;
  readonly details?: string;

  constructor({
    message,
    solution,
    details,
  }: {
    message: string;
    solution: string;
    details?: string;
  }) {
    super(message);
    this.solution = solution;
    this.details = details;
  }
}

export class ProjectDesignNotFoundError extends PlainlyMcpServerError {
  constructor(projectDesignId: string) {
    super({
      message: `Project / design with ID ${projectDesignId} not found.`,
      solution: "Verify the project design ID and try again.",
    });
  }
}

export class TemplateVariantNotFoundError extends PlainlyMcpServerError {
  constructor(templateVariantId: string, projectDesignId: string) {
    super({
      message: `Template variant with ID ${templateVariantId} not found in project / design ${projectDesignId}.`,
      solution: "Verify the template variant ID and try again.",
    });
  }
}

export class MissingParametersError extends PlainlyMcpServerError {
  constructor(missing: { key: string; label: string | null }[]) {
    super({
      message: "Missing required parameters.",
      solution: "Check the error details and provide missing mandatory parameters.",
      details: JSON.stringify(missing),
    });
  }
}

export class InvalidRenderError extends PlainlyMcpServerError {
  constructor(message: string, invalidParams?: { key?: string; errors: string[] }[]) {
    super({
      message: message || "An error occurred while creating the render.",
      solution: "Check the error details and adjust the parameters accordingly.",
      details: JSON.stringify(invalidParams),
    });
  }
}

export class GeneralRenderError extends PlainlyMcpServerError {
  constructor(message: string, error: { [key: string]: string | object }) {
    super({
      message: message || "An error occurred while creating the render.",
      solution: "Explain the error message and suggest next steps.",
      details: JSON.stringify(error),
    });
  }
}
