import { CreateUserDto, UsersModule } from '../../src/users';
import config from '../../src/mikro-orm.config';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MikroOrmModule } from '@mikro-orm/nestjs';

describe('/users', () => {
  const user = {
    id: 2,
    firstName: 'Karl',
    lastName: 'Jablonski',
    isActive: true
  };

  let app!: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        ConfigModule.forRoot(),
        MikroOrmModule.forRoot(config)
      ]
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());

  describe('POST /', () => {
    it('should create a user', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .send(user as CreateUserDto)
        .expect(201);

      expect(res).toMatchObject({ body: user });
    });
  });

  describe('GET /', () => {
    it('should return a list of users', async () => {
      const res = await request(app.getHttpServer()).get('/users').expect(200);

      expect(res).toMatchObject({
        body: expect.arrayContaining([expect.objectContaining(user)])
      });
    });
  });

  describe('GET /:id', () => {
    it('should return an user by ID', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/2')
        .expect(200);

      expect(res).toMatchObject({
        body: user
      });
    });

    it('should return an user if boolean-based blind is used', async () => {
      const res = await request(app.getHttpServer())
        .get('/users/1000000 OR 2028=2028')
        .expect(200);

      expect(res).toMatchObject({
        body: {
          firstName: expect.any(String),
          lastName: expect.any(String),
          isActive: expect.any(Boolean)
        }
      });
    });
  });

  describe('DEL /:id', () => {
    // eslint-disable-next-line jest/expect-expect
    it('should remove an user by ID', () =>
      request(app.getHttpServer()).delete('/users/2').expect(200));
  });
});
