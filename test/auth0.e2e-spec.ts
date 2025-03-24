import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

interface AuthResponse {
  access_token: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

describe('Auth0 Authentication (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth0 Login Flow', () => {
    it('should redirect to Auth0 login page', () => {
      return request(app.getHttpServer())
        .get('/auth/auth0')
        .expect(302)
        .expect('Location', /^https:\/\/.*\.auth0\.com\/authorize/);
    });

    it('should handle Auth0 callback and create user', async () => {
      // Mock Auth0 callback response
      const mockAuth0User = {
        profile: {
          id: 'auth0|123',
          displayName: 'Test User',
          name: {
            givenName: 'Test',
            familyName: 'User',
          },
          emails: [{ value: 'test@example.com' }],
        },
      };

      // Simulate Auth0 callback
      return request(app.getHttpServer())
        .get('/auth/auth0/callback')
        .set('Authorization', `Bearer ${mockAuth0User.profile.id}`)
        .expect(200)
        .expect((res) => {
          const response = res.body as AuthResponse;
          expect(response).toHaveProperty('access_token');
          expect(response).toHaveProperty('user');
          expect(response.user).toMatchObject({
            email: mockAuth0User.profile.emails[0].value,
            firstName: mockAuth0User.profile.name.givenName,
            lastName: mockAuth0User.profile.name.familyName,
          });
        });
    });

    it('should handle duplicate Auth0 user registration', async () => {
      const mockAuth0User = {
        profile: {
          id: 'auth0|123',
          displayName: 'Test User',
          name: {
            givenName: 'Test',
            familyName: 'User',
          },
          emails: [{ value: 'test@example.com' }],
        },
      };

      // First registration
      await request(app.getHttpServer())
        .get('/auth/auth0/callback')
        .set('Authorization', `Bearer ${mockAuth0User.profile.id}`)
        .expect(200);

      // Second registration with same user
      return request(app.getHttpServer())
        .get('/auth/auth0/callback')
        .set('Authorization', `Bearer ${mockAuth0User.profile.id}`)
        .expect(200)
        .expect((res) => {
          const response = res.body as AuthResponse;
          expect(response).toHaveProperty('access_token');
          expect(response).toHaveProperty('user');
        });
    });
  });
});
