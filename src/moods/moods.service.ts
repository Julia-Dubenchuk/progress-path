import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMoodDto } from './dto/create-mood.dto';
import { UpdateMoodDto } from './dto/update-mood.dto';
import { Mood } from './entities/mood.entity';

@Injectable()
export class MoodsService {
  constructor(
    @InjectRepository(Mood)
    private readonly moodRepository: Repository<Mood>,
  ) {}

  async create(createMoodDto: CreateMoodDto): Promise<Mood> {
    const mood = this.moodRepository.create(createMoodDto);
    return this.moodRepository.save(mood);
  }

  findAll(): Promise<Mood[]> {
    return this.moodRepository.find();
  }

  async findOne(id: string): Promise<Mood> {
    const mood = await this.moodRepository.findOne({ where: { id } });

    if (!mood) {
      throw new NotFoundException(`Mood with id ${id} not found`);
    }

    return mood;
  }

  async update(id: string, updateMoodDto: UpdateMoodDto): Promise<Mood> {
    const mood = await this.findOne(id);
    const updated = this.moodRepository.merge(mood, updateMoodDto);

    return this.moodRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const result = await this.moodRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Mood with id ${id} not found`);
    }
  }
}
