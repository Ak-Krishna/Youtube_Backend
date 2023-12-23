class ApiResponse {
  constructor(statusCode, message = "success") {
    this.statusCode = statusCode;
    this.message = message;
  }
}

export {ApiResponse}