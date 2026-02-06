import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Res,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UserProfilesService } from './user-profiles.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserProfile } from './entities/user-profile.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('User Profiles')
@Controller('user-profiles')
export class UserProfilesController {
  constructor(private readonly userProfilesService: UserProfilesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user profile' })
  @ApiCreatedResponse({ type: UserProfile })
  @ApiBadRequestResponse({ description: 'Invalid profile data' })
  @ApiBody({ type: CreateUserProfileDto })
  create(@Body() createUserProfileDto: CreateUserProfileDto) {
    return this.userProfilesService.create(createUserProfileDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user profiles' })
  @ApiOkResponse({ type: [UserProfile] })
  findAll() {
    return this.userProfilesService.findAll();
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get a user profile by userId' })
  @ApiParam({ name: 'userId', description: 'The ID of the user' })
  @ApiOkResponse({ type: UserProfile })
  @ApiNotFoundResponse({ description: 'User profile not found' })
  findOne(@Param('userId') id: string) {
    return this.userProfilesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':userId')
  @ApiOperation({ summary: 'Update a user profile' })
  @ApiParam({ name: 'userId', description: 'The ID of the user' })
  @ApiOkResponse({ type: UserProfile })
  @ApiBadRequestResponse({ description: 'Invalid update data' })
  @ApiNotFoundResponse({ description: 'User profile not found' })
  @ApiBody({ type: UpdateUserProfileDto })
  update(
    @CurrentUser() currentUser: User,
    @Param('userId') id: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.userProfilesService.update({
      currentUser,
      userId: id,
      updateUserProfileDto,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':userId')
  @ApiOperation({ summary: 'Remove a user profile' })
  @ApiParam({ name: 'userId', description: 'The ID of the user' })
  @ApiOkResponse({ description: 'Profile removed successfully' })
  @ApiNotFoundResponse({ description: 'User profile not found' })
  remove(@CurrentUser() currentUser: User, @Param('userId') id: string) {
    return this.userProfilesService.remove(currentUser, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':userId/upload-picture')
  @ApiOperation({ summary: 'Upload profile picture for a user' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  uploadProfilePicture(
    @CurrentUser() currentUser: User,
    @Param('userId') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userProfilesService.updateProfilePicture({
      currentUser,
      userId: id,
      buffer: file.buffer,
    });
  }

  @Get(':userId/profile-picture')
  @ApiOperation({ summary: 'Get user profile picture' })
  async getProfilePicture(@Param('userId') id: string, @Res() res: Response) {
    const picture = await this.userProfilesService.getProfilePicture(id);

    if (!picture) {
      throw new NotFoundException('Profile picture not found');
    }

    res.setHeader('Content-Type', 'image/png');
    res.send(picture);
  }
}
