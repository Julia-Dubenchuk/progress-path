import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { ActionOnResource } from '../auth/decorators/action-on-resource.decorator';
import { RoleName } from '../roles/entities/role.entity';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  @ActionOnResource({ roles: [RoleName.ADMIN] })
  create(@Body() createListDto: CreateListDto) {
    return this.listsService.create(createListDto);
  }

  @Get()
  findAll() {
    return this.listsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listsService.findOne(id);
  }

  @Patch(':id')
  @ActionOnResource({ roles: [RoleName.ADMIN] })
  update(@Param('id') id: string, @Body() updateListDto: UpdateListDto) {
    return this.listsService.update(id, updateListDto);
  }

  @Delete(':id')
  @ActionOnResource({ roles: [RoleName.ADMIN] })
  remove(@Param('id') id: string) {
    return this.listsService.remove(id);
  }
}
