import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ItemsService } from '../items.service';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { PoliciesGuard } from '../../auth/guards/policies.guard';
import { CheckPolicies } from '../../auth/decorators/check-policies.decorator';
import { Action } from '../../permissions/entities/permission.entity';
import { RoleName } from '../../roles/entities/role.entity';
import { AppAbility } from '../../auth/casl/casl-ability.factory';
import {
  CurrentUser,
  JwtPayload,
} from '../../auth/decorators/current-user.decorator';
import { ActionOnResource } from '../../auth/decorators/action-on-resource.decorator';

@Controller('admin/items')
export class ItemsAdminController {
  constructor(private readonly itemsService: ItemsService) {}

  // Using role-based access control
  @Post()
  @ActionOnResource({ roles: [RoleName.ADMIN] })
  create(
    @Body() createItemDto: CreateItemDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.itemsService.create(createItemDto, user.sub);
  }

  // Using permission-based access control
  @Get()
  @ActionOnResource({ permissions: [Action.UPDATE_CONTENT] })
  findAll() {
    return this.itemsService.findAll();
  }

  // Using policy-based access control
  @Get(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility) =>
    ability.can(Action.UPDATE_CONTENT, 'all'),
  )
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id);
  }

  // Combining roles and permissions
  @Put(':id')
  @ActionOnResource({
    roles: [RoleName.ADMIN, RoleName.PREMIUM],
    permissions: [Action.UPDATE_CONTENT],
    requireAll: true,
  })
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemsService.update(id, updateItemDto);
  }

  // Admin-only action
  @Delete(':id')
  @ActionOnResource({ roles: [RoleName.ADMIN] })
  remove(@Param('id') id: string) {
    return this.itemsService.remove(id);
  }
}
