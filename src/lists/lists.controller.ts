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
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ListsService } from './lists.service';
import { CreateListDto } from './dto/create-list.dto';
import { ListPaginationQueryDto } from './dto/list-pagination-query.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { ActionOnResource } from '../auth/decorators/action-on-resource.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleName } from '../roles/entities/role.entity';
import {
  CurrentUser,
  JwtPayload,
} from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  @ActionOnResource({ roles: [RoleName.ADMIN] })
  create(
    @Body() createListDto: CreateListDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.listsService.create(createListDto, user.sub);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query(new ValidationPipe({ transform: true, whitelist: true }))
    paginationQuery: ListPaginationQueryDto,
  ) {
    return this.listsService.findAll(
      user.sub,
      paginationQuery.page,
      paginationQuery.limit,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.listsService.findOne(id, user.sub);
  }

  @Patch(':id')
  @ActionOnResource({ roles: [RoleName.ADMIN] })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateListDto: UpdateListDto,
    @CurrentUser() currentUser: User,
  ) {
    return this.listsService.update({
      currentUser,
      id,
      dto: updateListDto,
    });
  }

  @Delete(':id')
  @ActionOnResource({ roles: [RoleName.ADMIN] })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.listsService.remove(id);
  }
}
