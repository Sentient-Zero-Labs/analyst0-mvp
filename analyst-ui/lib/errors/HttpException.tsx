export class HttpException extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpException";
    this.status = status;
  }
}
