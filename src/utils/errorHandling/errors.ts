export interface HttpErrorType {
  statusCode: number;
  message: string;
}

export class HttpError extends Error {
  public message: string;
  public statusCode: number;
  public name: string;

  constructor(errorDescription: HttpErrorType) {
    super(errorDescription.message);

    this.statusCode = errorDescription.statusCode;
    this.message = errorDescription.message;
    this.name = 'HTTPError';
  }

  protected getDescriptor() {
    return {
      message: this.message,
      statusCode: this.statusCode,
    };
  }
}
