import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SubscriptionDetailsService } from './subscription-details.service';
import { CreateSubscriptionDetailDto } from './dto/create-subscription-detail.dto';
import { UpdateSubscriptionDetailDto } from './dto/update-subscription-detail.dto';

@Controller('subscription-details')
export class SubscriptionDetailsController {
  constructor(private readonly subscriptionDetailsService: SubscriptionDetailsService) {}

  @Post()
  create(@Body() createSubscriptionDetailDto: CreateSubscriptionDetailDto) {
    return this.subscriptionDetailsService.create(createSubscriptionDetailDto);
  }

  @Get()
  findAll() {
    return this.subscriptionDetailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionDetailsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubscriptionDetailDto: UpdateSubscriptionDetailDto) {
    return this.subscriptionDetailsService.update(+id, updateSubscriptionDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionDetailsService.remove(+id);
  }
}
