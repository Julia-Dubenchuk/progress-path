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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubscriptionDetailsService } from './subscription-details.service';
import { CreateSubscriptionDetailDto } from './dto/create-subscription-detail.dto';
import { UpdateSubscriptionDetailDto } from './dto/update-subscription-detail.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Subscription Details')
@Controller('subscription-details')
export class SubscriptionDetailsController {
  constructor(
    private readonly subscriptionDetailsService: SubscriptionDetailsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create subscription details for a user' })
  @ApiResponse({
    status: 201,
    description: 'Subscription details created successfully.',
  })
  create(@Body() createSubscriptionDetailDto: CreateSubscriptionDetailDto) {
    return this.subscriptionDetailsService.create(createSubscriptionDetailDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all subscription details' })
  @ApiResponse({
    status: 200,
    description: 'List of all subscription details.',
  })
  findAll() {
    return this.subscriptionDetailsService.findAll();
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get subscription details by userId' })
  @ApiParam({ name: 'userId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Subscription details for the specified user.',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription details not found.',
  })
  findOne(@Param('userId') userId: string) {
    return this.subscriptionDetailsService.findOne(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':userId')
  @ApiOperation({ summary: 'Update subscription details by userId' })
  @ApiParam({ name: 'userId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Subscription details updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription details not found.',
  })
  update(
    @CurrentUser() currentUser: User,
    @Param('userId') userId: string,
    @Body() updateSubscriptionDetailDto: UpdateSubscriptionDetailDto,
  ) {
    return this.subscriptionDetailsService.update({
      currentUser,
      userId,
      updateSubscriptionDetailDto,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':userId')
  @ApiOperation({ summary: 'Delete subscription details by userId' })
  @ApiParam({ name: 'userId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'Subscription details deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Subscription details not found.',
  })
  remove(@CurrentUser() currentUser: User, @Param('userId') userId: string) {
    return this.subscriptionDetailsService.remove(currentUser, userId);
  }
}
