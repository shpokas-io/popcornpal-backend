import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../app.module';

describe('AuthController (e2e', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/auth/signup (POST) - should sign up a new user', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'testuser@example.com', password: 'testpassword' })
      .expect(201);
  });

  it('auth/login (POST) - should log in a user', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'testuser@example.com', password: 'testpassword' })
      .expect(200)
      .then((res) => {
        expect(res.body.access_token.toBeDefined());
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
