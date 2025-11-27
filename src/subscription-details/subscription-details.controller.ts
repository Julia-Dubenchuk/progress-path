import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubscriptionDetailsService } from './subscription-details.service';
import { CreateSubscriptionDetailDto } from './dto/create-subscription-detail.dto';
import { UpdateSubscriptionDetailDto } from './dto/update-subscription-detail.dto';

@Controller('subscription-details')
export class SubscriptionDetailsController {
  constructor(
    private readonly subscriptionDetailsService: SubscriptionDetailsService,
  ) {}

  @Post()
  create(@Body() createSubscriptionDetailDto: CreateSubscriptionDetailDto) {
    return this.subscriptionDetailsService.create(createSubscriptionDetailDto);
  }

  @Get()
  findAll() {
    return this.subscriptionDetailsService.findAll();
  }

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.subscriptionDetailsService.findOne(userId);
  }

  @Patch(':userId')
  update(
    @Param('userId') userId: string,
    @Body() updateSubscriptionDetailDto: UpdateSubscriptionDetailDto,
  ) {
    return this.subscriptionDetailsService.update(
      userId,
      updateSubscriptionDetailDto,
    );
  }

  @Delete(':userId')
  remove(@Param('userId') userId: string) {
    return this.subscriptionDetailsService.remove(userId);
  }
}
