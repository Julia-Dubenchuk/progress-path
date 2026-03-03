import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoodsService } from './moods.service';
import { MoodsController } from './moods.controller';
import { Mood } from './entities/mood.entity';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Mood, User])],
  controllers: [MoodsController],
  providers: [MoodsService, RolesGuard],
  exports: [TypeOrmModule],
})
export class MoodsModule {}
