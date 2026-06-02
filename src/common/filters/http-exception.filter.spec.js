const { BadRequestException } = require('@nestjs/common');
const { getHttpExceptionMessage } = require('./http-exception-message');

describe('getHttpExceptionMessage', () => {
  it('should serialize string errors', () => {
    const message = getHttpExceptionMessage(new BadRequestException('invalid payload'));

    expect(message).toBe('invalid payload');
  });

  it('should join array errors', () => {
    const exception = new BadRequestException({ message: ['a', 'b'] });

    expect(getHttpExceptionMessage(exception)).toBe('a, b');
  });
});