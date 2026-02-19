import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoodsService } from './moods.service';
import { MoodsController } from './moods.controller';
import { Mood } from './entities/mood.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Mood])],
  controllers: [MoodsController],
  providers: [MoodsService, RolesGuard],
  exports: [TypeOrmModule],
})
export class MoodsModule {}
