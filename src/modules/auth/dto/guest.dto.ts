import { ApiProperty } from '@nestjs/swagger';

export class GuestDto {
  @ApiProperty({ example: 'guest-session-id' })
  sessionId: string;
}