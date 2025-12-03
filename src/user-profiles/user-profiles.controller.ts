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

  @Patch(':userId')
  @ApiOperation({ summary: 'Update a user profile' })
  @ApiParam({ name: 'userId', description: 'The ID of the user' })
  @ApiOkResponse({ type: UserProfile })
  @ApiBadRequestResponse({ description: 'Invalid update data' })
  @ApiNotFoundResponse({ description: 'User profile not found' })
  @ApiBody({ type: UpdateUserProfileDto })
  update(
    @Param('userId') id: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    return this.userProfilesService.update(id, updateUserProfileDto);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Remove a user profile' })
  @ApiParam({ name: 'userId', description: 'The ID of the user' })
  @ApiOkResponse({ description: 'Profile removed successfully' })
  @ApiNotFoundResponse({ description: 'User profile not found' })
  remove(@Param('userId') id: string) {
    return this.userProfilesService.remove(id);
  }

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
    @Param('userId') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.userProfilesService.updateProfilePicture(id, file.buffer);
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
