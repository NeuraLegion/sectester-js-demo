import { ApiProperty } from '@nestjs/swagger';

/** Payload for creating a user. */
export class CreateUserDto {
  @ApiProperty()
  public firstName!: string;

  @ApiProperty()
  public lastName!: string;
}
