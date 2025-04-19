import { DataSource, Repository } from 'typeorm';
import { Seeder, SeederFactoryManager, SeederFactory } from 'typeorm-extension';
import { User } from '../../users/entities/user.entity';
import { List } from '../../lists/entities/list.entity';
import { Item } from '../../items/entities/item.entity';
import {
  Category,
  CategoryTitle,
} from '../../categories/entities/category.entity';
import { Mood } from '../../moods/entities/mood.entity';

// Configuration for data counts
interface SeedCounts {
  itemsPerList: number;
  moods: number;
  categories: number;
}

export default class SampleDataSeeder implements Seeder {
  // Default counts for seeding
  private counts: SeedCounts = {
    itemsPerList: 5,
    moods: 7,
    categories: Object.values(CategoryTitle).length,
  };

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<void> {
    const userRepository = dataSource.getRepository(User);
    const listRepository = dataSource.getRepository(List);
    const itemRepository = dataSource.getRepository(Item);
    const categoryRepository = dataSource.getRepository(Category);
    const moodRepository = dataSource.getRepository(Mood);

    const categoryFactory = factoryManager.get(Category);
    const listFactory = factoryManager.get(List);
    const itemFactory = factoryManager.get(Item);
    const moodFactory = factoryManager.get(Mood);

    const testUser = await userRepository.findOne({
      where: { email: 'test@example.com' },
    });

    if (!testUser) {
      console.warn('Test user not found. Skipping sample data creation.');
      return;
    }

    await this.createMoods(moodRepository, testUser, moodFactory);

    await this.createCategories(categoryRepository, categoryFactory);

    const existingCategories = await categoryRepository.find();

    if (!existingCategories.length) {
      console.warn('Categories not found. Skipping lists creation.');
      return;
    }

    for (const category of existingCategories) {
      await this.createLists(
        listRepository,
        itemRepository,
        testUser,
        category,
        listFactory,
        itemFactory,
      );
    }
  }

  private async createLists(
    listRepository: Repository<List>,
    itemRepository: Repository<Item>,
    user: User,
    category: Category,
    listFactory: SeederFactory<List>,
    itemFactory: SeederFactory<Item>,
  ): Promise<void> {
    // Use factory to create the list
    const list = await listFactory.make();

    const existingList = await listRepository.findOne({
      where: { title: list.title, userId: user.id },
    });

    if (existingList) return;

    list.user = user;
    list.userId = user.id;
    list.category = category;
    list.categoryId = category.id;

    const savedList = await listRepository.save(list);

    // Create items for this list
    await this.createItemsForList(savedList, itemRepository, itemFactory);
  }

  private async createItemsForList(
    list: List,
    itemRepository: Repository<Item>,
    itemFactory: SeederFactory<Item>,
  ): Promise<void> {
    // Create items
    for (let i = 0; i < this.counts.itemsPerList; i++) {
      const item = await itemFactory.make();

      const existingItem = await itemRepository.findOne({
        where: { title: item.title, listId: list.id },
      });

      if (existingItem) continue;

      item.list = list;
      item.listId = list.id;

      await itemRepository.save(item);
    }
  }

  private async createCategories(
    categoryRepository: Repository<Category>,
    categoryFactory: SeederFactory<Category>,
  ): Promise<void> {
    for (let i = 0; i < this.counts.categories; i++) {
      // Create the category with factory
      const category = await categoryFactory.make();

      const existingCategory = await categoryRepository.findOne({
        where: { title: category.title },
      });

      if (existingCategory) continue;

      await categoryRepository.save(category);
    }
  }

  private async createMoods(
    moodRepository: Repository<Mood>,
    user: User,
    moodFactory: SeederFactory<Mood>,
  ): Promise<void> {
    const existingMoods = await moodRepository.find();
    if (existingMoods.length > 0) return;

    // Create multiple moods
    for (let i = 0; i < this.counts.moods; i++) {
      const mood = await moodFactory.make();

      const existingMood = await moodRepository.findOne({
        where: { mood: mood.mood, userId: user.id },
      });

      if (existingMood) continue;

      mood.user = user;
      mood.userId = user.id;

      await moodRepository.save(mood);
    }
  }
}
