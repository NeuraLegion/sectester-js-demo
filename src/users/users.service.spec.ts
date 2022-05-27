import { User } from './user.entity';
import { UsersService } from './users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { MikroORM } from '@mikro-orm/core';

const userArray = [
  {
    firstName: 'firstName #1',
    lastName: 'lastName #1'
  },
  {
    firstName: 'firstName #2',
    lastName: 'lastName #2'
  }
];

const oneUser = {
  firstName: 'firstName #1',
  lastName: 'lastName #1'
};

describe('UserService', () => {
  let service: UsersService;
  let orm: MikroORM;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: MikroORM,
          useValue: {
            em: {
              find: jest.fn().mockResolvedValue(userArray),
              findOne: jest.fn().mockResolvedValue(oneUser),
              removeAndFlush: jest.fn(),
              persistAndFlush: jest.fn(),
              map: jest
                .fn()
                .mockImplementation((_: typeof User, entity: User) => entity),
              assign: jest
                .fn()
                .mockImplementation((entity: User, data: Partial<User>) =>
                  Object.assign(entity, data)
                ),
              getConnection: jest.fn().mockReturnValue({
                execute: jest.fn().mockResolvedValue(userArray)
              })
            }
          }
        }
      ]
    }).compile();

    service = module.get<UsersService>(UsersService);
    orm = module.get<MikroORM>(MikroORM);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should successfully insert a user', async () => {
      const input = {
        firstName: 'firstName #1',
        lastName: 'lastName #1'
      };

      const result = await service.create(input);

      expect(result).toEqual(oneUser);
    });
  });

  describe('findAll()', () => {
    it('should return an array of users', async () => {
      const users = await service.findAll();
      expect(users).toEqual(userArray);
    });
  });

  describe('findOne()', () => {
    it('should get a single user', async () => {
      const input = 1;

      const result = await service.findOne(input);

      expect(orm.em.getConnection().execute).toBeCalledWith(
        `SELECT * FROM user WHERE id = ${input}`
      );
      expect(result).toEqual(oneUser);
    });
  });

  describe('remove()', () => {
    it('should call remove with the passed value', async () => {
      await service.remove(2);

      expect(orm.em.removeAndFlush).toBeCalledWith({ id: 2 });
    });
  });
});
