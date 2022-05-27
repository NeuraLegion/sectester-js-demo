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

  public async findOne(id: number): Promise<User | null> {
    const [user]: User[] = await this.orm.em
      .getConnection()
      .execute(`SELECT * FROM user WHERE id = ${id}`);

    return this.orm.em.map(User, user);
  }

  public async remove(id: number): Promise<void> {
    const user = this.orm.em.getReference(User, id);

    await this.orm.em.removeAndFlush(user);
  }
}
