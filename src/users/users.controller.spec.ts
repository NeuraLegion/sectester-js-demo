import { CreateUserDto } from './create-user.dto';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Test } from '@nestjs/testing';

describe('UsersController', () => {
  let usersController!: UsersController;
  let usersService!: UsersService;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: UsersService,
          useValue: {
            create: jest
              .fn()
              .mockImplementation((user: CreateUserDto) =>
                Promise.resolve({ id: 1, ...user })
              ),
            findAll: jest.fn().mockResolvedValue([
              {
                firstName: 'firstName #1',
                lastName: 'lastName #1'
              },
              {
                firstName: 'firstName #2',
                lastName: 'lastName #2'
              }
            ]),
            findOne: jest.fn().mockImplementation((id: number) =>
              Promise.resolve({
                firstName: 'firstName #1',
                lastName: 'lastName #1',
                id
              })
            ),
            remove: jest.fn()
          }
        }
      ]
    }).compile();

    usersController = app.get<UsersController>(UsersController);
    usersService = app.get<UsersService>(UsersService);
  });

  it('should be defined', () => expect(usersController).toBeDefined());

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'firstName #1',
        lastName: 'lastName #1'
      };

      const result = await usersController.create(createUserDto);

      expect(result).toEqual({
        id: 1,
        ...createUserDto
      });
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should find all users', async () => {
      await usersController.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find a user', async () => {
      const input = 1;

      const result = await usersController.findOne(input);

      expect(result).toEqual({
        firstName: 'firstName #1',
        lastName: 'lastName #1',
        id: 1
      });
      expect(usersService.findOne).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove the user', async () => {
      await usersController.remove(2);

      expect(usersService.remove).toHaveBeenCalled();
    });
  });
});
