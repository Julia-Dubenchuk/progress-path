import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPreferencesService } from './user-preferences.service';
import { UserPreferencesController } from './user-preferences.controller';
import { UserPreference } from './entities/user-preference.entity';
import { AuthorizationModule } from '../common/authorization/authorization.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserPreference]), AuthorizationModule],
  controllers: [UserPreferencesController],
  providers: [UserPreferencesService],
  exports: [TypeOrmModule],
})
export class UserPreferencesModule {}
