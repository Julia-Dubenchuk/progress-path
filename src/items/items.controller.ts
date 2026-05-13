import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { UpdateItemStatusDto } from './dto/update-item-status.dto';
import { ActionOnResource } from '../auth/decorators/action-on-resource.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RoleName } from '../roles/entities/role.entity';
import { User } from '../users/entities/user.entity';

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new item' })
  @ApiBody({ type: CreateItemDto })
  @ApiResponse({
    status: 201,
    description: 'The item has been successfully created.',
  })
  @ActionOnResource({ roles: [RoleName.ADMIN] })
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(createItemDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all items' })
  @ApiResponse({ status: 200, description: 'Return all items.' })
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.itemsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an item by id' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiResponse({ status: 200, description: 'Return the item.' })
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemsService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update an item status' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiBody({ type: UpdateItemStatusDto })
  @ApiResponse({
    status: 200,
    description: 'The item status has been successfully updated.',
  })
  @UseGuards(JwtAuthGuard)
  updateStatus(
    @CurrentUser() currentUser: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateItemStatusDto: UpdateItemStatusDto,
  ) {
    return this.itemsService.updateStatus(currentUser, id, updateItemStatusDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiBody({ type: UpdateItemDto })
  @ApiResponse({
    status: 200,
    description: 'The item has been successfully updated.',
  })
  @ActionOnResource({ roles: [RoleName.ADMIN] })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateItemDto: UpdateItemDto,
  ) {
    return this.itemsService.update(id, updateItemDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an item' })
  @ApiParam({ name: 'id', description: 'Item ID' })
  @ApiResponse({
    status: 200,
    description: 'The item has been successfully deleted.',
  })
  @ActionOnResource({ roles: [RoleName.ADMIN] })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemsService.remove(id);
  }
}
