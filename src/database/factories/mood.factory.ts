import { setSeederFactory } from 'typeorm-extension';
import { faker } from '@faker-js/faker/locale/en';
import { Mood } from '../../moods/entities/mood.entity';

export default setSeederFactory(Mood, () => {
  const mood = new Mood();

  const moodOptions = [
    'happy',
    'sad',
    'anxious',
    'calm',
    'excited',
    'frustrated',
  ];

  mood.mood = faker.helpers.arrayElement(moodOptions);
  mood.note = faker.lorem.paragraph();
  mood.date = faker.date.recent();
  mood.userId = faker.string.uuid();

  return mood;
});
