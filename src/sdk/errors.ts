export class PlainlyApiError extends Error {
  constructor(status: number, reason?: string) {
    reason = reason || "Please contact support.";
    super(`Plainly API error (status ${status}): ${reason}`);
  }
}

export class PlainlyApiAuthenticationError extends PlainlyApiError {
  constructor(status: number) {
    super(status, "Authentication failed. Check your API key.");
  }
}
