import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMoodDto } from './dto/create-mood.dto';
import { UpdateMoodDto } from './dto/update-mood.dto';
import { Mood } from './entities/mood.entity';
import { User } from '../users/entities/user.entity';
import { getOwnerScopedWhere } from '../common/authorization/owner-scoped-query.util';

@Injectable()
export class MoodsService {
  constructor(
    @InjectRepository(Mood)
    private readonly moodRepository: Repository<Mood>,
  ) {}

  async create(createMoodDto: CreateMoodDto, userId: string): Promise<Mood> {
    const mood = this.moodRepository.create({
      ...createMoodDto,
      userId,
    });
    return this.moodRepository.save(mood);
  }

  findAll(currentUser: User): Promise<Mood[]> {
    const where = getOwnerScopedWhere(currentUser, {
      userId: currentUser.id,
    });

    return this.moodRepository.find({ where });
  }

  async findOne(id: string, currentUser: User): Promise<Mood> {
    const where = getOwnerScopedWhere(
      currentUser,
      { id, userId: currentUser.id },
      { id },
    );
    const mood = await this.moodRepository.findOne({ where });

    if (!mood) {
      throw new NotFoundException(`Mood with id ${id} not found`);
    }

    return mood;
  }

  async update(id: string, updateMoodDto: UpdateMoodDto): Promise<Mood> {
    const mood = await this.findOneById(id);
    const updated = this.moodRepository.merge(mood, updateMoodDto);

    return this.moodRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.moodRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Mood with id ${id} not found`);
    }
  }

  private async findOneById(id: string): Promise<Mood> {
    const mood = await this.moodRepository.findOne({ where: { id } });

    if (!mood) {
      throw new NotFoundException(`Mood with id ${id} not found`);
    }

    return mood;
  }
}
