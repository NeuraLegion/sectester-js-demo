import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @PrimaryKey()
  @ApiProperty({ default: 1 })
  public id!: number;

  @Property()
  @ApiProperty()
  public firstName!: string;

  @Property()
  @ApiProperty()
  public lastName!: string;

  @Property({ default: true })
  @ApiProperty()
  public isActive!: boolean;
}
