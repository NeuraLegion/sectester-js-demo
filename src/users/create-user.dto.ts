import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  public firstName!: string;

  @ApiProperty()
  public lastName!: string;
}
