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
import { MoodsService } from './moods.service';
import { CreateMoodDto } from './dto/create-mood.dto';
import { UpdateMoodDto } from './dto/update-mood.dto';
import { ActionOnResource } from '../auth/decorators/action-on-resource.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RoleName } from '../roles/entities/role.entity';
import {
  CurrentUser,
  JwtPayload,
} from '../auth/decorators/current-user.decorator';

@Controller('moods')
export class MoodsController {
  constructor(private readonly moodsService: MoodsService) {}

  @Post()
  @ActionOnResource({ roles: [RoleName.ADMIN] })
  create(
    @Body() createMoodDto: CreateMoodDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.moodsService.create(createMoodDto, user.sub);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.moodsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.moodsService.findOne(id);
  }

  @Patch(':id')
  @ActionOnResource({ roles: [RoleName.ADMIN] })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMoodDto: UpdateMoodDto,
  ) {
    return this.moodsService.update(id, updateMoodDto);
  }

  @Delete(':id')
  @ActionOnResource({ roles: [RoleName.ADMIN] })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.moodsService.remove(id);
  }
}
