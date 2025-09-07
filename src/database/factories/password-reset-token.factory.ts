import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker/locale/en';
import { PasswordResetToken } from '../../auth/entities/password-reset-token.entity';

export default setSeederFactory(PasswordResetToken, () => {
  const passwordResetToken = new PasswordResetToken();

  const token = faker.string.uuid();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  passwordResetToken.tokenHash = token;
  passwordResetToken.expiresAt = expiresAt;
  passwordResetToken.used = false;

  return passwordResetToken;
});
