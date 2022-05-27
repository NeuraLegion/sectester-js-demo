import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class User {
  @PrimaryKey()
  public id!: number;

  @Property()
  public firstName!: string;

  @Property()
  public lastName!: string;

  @Property({ default: true })
  public isActive!: boolean;
}
