import { User } from './user.entity';
import { CreateUserDto } from './create-user.dto';
import { Injectable } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';

@Injectable()
export class UsersService {
  constructor(private readonly orm: MikroORM) {}

  public async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();

    this.orm.em.assign(user, createUserDto);

    await this.orm.em.persistAndFlush(user);

    return user;
  }

  public findAll(query: Omit<Partial<User>, 'id'> = {}): Promise<User[]> {
    return this.orm.em.find(User, { ...query });
  }

  /**
   * This method performs a simple SQL query that would typically search through the users table and retrieve
   * the user who has a concrete ID. However, an attacker can easily use the lack of validation from
   * user inputs to read sensitive data from the database, modify database data, or
   * execute administration operations by inputting values that the developer did not consider a valid (e.g. `1 OR 2028=2028` or `1; DROP user--`)
   *
   * Using the built-in `findOne` method that escapes the input passed to it automatically before it is inserted into the query,
   * you can fix the actual issue:
   * ```ts
   * public findOne(id: number): Promise<User | null> {
   *   return this.orm.em.findOne({ id });
   * }
   * ```
   *
   * You can also use what are known as query placeholders or name placeholders:
   * ```ts
   * public async findOne(id: number): Promise<User | null> {
   *   const [user]: User[] = await this.orm.em
   *    .getConnection()
   *    .execute(`select * from "user" where "id" = ?`, [id]);
   *
   *   return this.orm.em.map(User, user);
   * }
   * ```
   */
  public async findOne(id: number): Promise<User | null> {
    const [user]: User[] = await this.orm.em
      .getConnection()
      .execute(`select * from "user" where "id" = ${id}`);

    return this.orm.em.map(User, user);
  }

  public async remove(id: number): Promise<void> {
    const user = this.orm.em.getReference(User, id);

    await this.orm.em.removeAndFlush(user);
  }
}
