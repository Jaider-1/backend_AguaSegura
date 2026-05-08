import { HttpException } from '@nestjs/common';

export function getHttpExceptionMessage(exception: HttpException): string {
  const responseBody = exception.getResponse();

  if (typeof responseBody === 'string') {
    return responseBody;
  }

  if (responseBody && typeof responseBody === 'object' && 'message' in responseBody) {
    const message = responseBody.message;
    if (Array.isArray(message)) {
      return message.join(', ');
    }

    if (message) {
      return String(message);
    }
  }

  return exception.message;
}
