import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ActivityLogsService } from './activity-logs.service';
import { CreateActivityLogDto } from './dto/create-activity-log.dto';
import { UpdateActivityLogDto } from './dto/update-activity-log.dto';
import { ActivityLog } from './entities/activity-log.entity';

@ApiTags('Activity Logs')
@Controller('activity-logs')
export class ActivityLogsController {
  constructor(private readonly activityLogsService: ActivityLogsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create activity log',
    description:
      'Creates a new activity log entry. Typically used internally (e.g., when a user resets a password, logs in, etc.).',
  })
  @ApiResponse({
    status: 201,
    description: 'The activity log was successfully created.',
    type: ActivityLog,
  })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  create(@Body() createActivityLogDto: CreateActivityLogDto) {
    return this.activityLogsService.create(createActivityLogDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all activity logs',
    description:
      'Returns a list of all recorded activity logs. Later, you can add pagination and filters.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all activity logs.',
    type: [ActivityLog],
  })
  findAll() {
    return this.activityLogsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get single activity log by ID',
    description: 'Finds and returns a specific activity log by its unique ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the activity log to retrieve',
    example: 'b5b3afc6-9b8a-4ed2-9b4d-9a7f70c3b9b0',
  })
  @ApiResponse({
    status: 200,
    description: 'The requested activity log.',
    type: ActivityLog,
  })
  @ApiResponse({ status: 404, description: 'Activity log not found.' })
  findOne(@Param('id') id: string) {
    return this.activityLogsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update activity log',
    description:
      'Updates an existing activity log by its ID. Usually used for adding additional info or correcting data.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the activity log to update',
    example: 'b5b3afc6-9b8a-4ed2-9b4d-9a7f70c3b9b0',
  })
  @ApiResponse({
    status: 200,
    description: 'The updated activity log.',
    type: ActivityLog,
  })
  @ApiResponse({ status: 404, description: 'Activity log not found.' })
  @ApiResponse({ status: 400, description: 'Validation failed.' })
  update(
    @Param('id') id: string,
    @Body() updateActivityLogDto: UpdateActivityLogDto,
  ) {
    return this.activityLogsService.update(id, updateActivityLogDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete activity log',
    description:
      'Removes an activity log from the database by its ID. Use carefully — logs are typically meant to be immutable.',
  })
  @ApiParam({
    name: 'id',
    description: 'UUID of the activity log to remove',
    example: 'b5b3afc6-9b8a-4ed2-9b4d-9a7f70c3b9b0',
  })
  @ApiResponse({
    status: 200,
    description: 'Activity log successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Activity log not found.' })
  remove(@Param('id') id: string) {
    return this.activityLogsService.remove(id);
  }
}
