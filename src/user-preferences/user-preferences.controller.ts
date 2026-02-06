import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserPreferencesService } from './user-preferences.service';
import { CreateUserPreferenceDto } from './dto/create-user-preference.dto';
import { UpdateUserPreferenceDto } from './dto/update-user-preference.dto';
import { UserPreference } from './entities/user-preference.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('User Preferences')
@Controller('user-preferences')
export class UserPreferencesController {
  constructor(
    private readonly userPreferencesService: UserPreferencesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create user preferences' })
  @ApiCreatedResponse({ type: UserPreference })
  @ApiBadRequestResponse({ description: 'Invalid preference data' })
  @ApiBody({ type: CreateUserPreferenceDto })
  create(@Body() createUserPreferenceDto: CreateUserPreferenceDto) {
    return this.userPreferencesService.create(createUserPreferenceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user preferences' })
  @ApiOkResponse({ type: [UserPreference] })
  findAll() {
    return this.userPreferencesService.findAll();
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get preferences for a specific user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiOkResponse({ type: UserPreference })
  @ApiNotFoundResponse({ description: 'Preferences not found' })
  findOne(@Param('userId') userId: string) {
    return this.userPreferencesService.findOne(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':userId')
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiOkResponse({ type: UserPreference })
  @ApiBadRequestResponse({ description: 'Invalid update data' })
  @ApiNotFoundResponse({ description: 'Preferences not found' })
  @ApiBody({ type: UpdateUserPreferenceDto })
  update(
    @CurrentUser() currentUser: User,
    @Param('userId') userId: string,
    @Body() updateUserPreferenceDto: UpdateUserPreferenceDto,
  ) {
    return this.userPreferencesService.update({
      currentUser,
      userId,
      updateUserPreferenceDto,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':userId')
  @ApiOperation({ summary: 'Delete user preferences' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiOkResponse({ description: 'Preferences removed successfully' })
  @ApiNotFoundResponse({ description: 'Preferences not found' })
  remove(@CurrentUser() currentUser: User, @Param('userId') userId: string) {
    return this.userPreferencesService.remove(currentUser, userId);
  }
}
