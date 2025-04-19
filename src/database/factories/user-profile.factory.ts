import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker/locale/en';
import {
  UserProfile,
  Gender,
} from '../../user-profiles/entities/user-profile.entity';

export default setSeederFactory(UserProfile, () => {
  const userProfile = new UserProfile();

  userProfile.bio = faker.lorem.paragraph();
  userProfile.profilePicture = Buffer.from(faker.image.avatar());
  userProfile.birthday = faker.date.birthdate();
  userProfile.gender = faker.helpers.arrayElement(Object.values(Gender));
  userProfile.location = faker.location.city();

  return userProfile;
});
