import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ActiveUser, HarvestsService } from './harvests.service';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Harvests')
@Controller('harvests')
export class HarvestsController {
  constructor(private harvestsService: HarvestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new harvest listing (FARMER only)' })
  create(
    @Req() req: { user: ActiveUser },
    @Body() dto: CreateHarvestDto,
  ) {
    return this.harvestsService.create(req.user.user_id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all available harvests' })
  findAll() {
    return this.harvestsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single harvest by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.harvestsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a harvest owned by the authenticated FARMER' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: ActiveUser },
    @Body() dto: UpdateHarvestDto,
  ) {
    return this.harvestsService.update(id, req.user, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('FARMER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a harvest owned by the authenticated FARMER' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: ActiveUser },
  ) {
    return this.harvestsService.remove(id, req.user);
  }
}