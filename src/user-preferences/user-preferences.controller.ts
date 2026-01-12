import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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

  @Patch(':userId')
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiOkResponse({ type: UserPreference })
  @ApiBadRequestResponse({ description: 'Invalid update data' })
  @ApiNotFoundResponse({ description: 'Preferences not found' })
  @ApiBody({ type: UpdateUserPreferenceDto })
  update(
    @Param('userId') userId: string,
    @Body() updateUserPreferenceDto: UpdateUserPreferenceDto,
  ) {
    return this.userPreferencesService.update(userId, updateUserPreferenceDto);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Delete user preferences' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiOkResponse({ description: 'Preferences removed successfully' })
  @ApiNotFoundResponse({ description: 'Preferences not found' })
  remove(@Param('userId') userId: string) {
    return this.userPreferencesService.remove(userId);
  }
}
