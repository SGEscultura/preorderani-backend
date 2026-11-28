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
import { PreOrdersService } from './pre-orders.service';
import { CreatePreOrderDto } from './dto/create-pre-order.dto';
import { UpdatePreOrderDto } from './dto/update-pre-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ActiveUser } from '../harvests/harvests.service';

@ApiTags('Pre-Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pre-orders')
export class PreOrdersController {
  constructor(private preOrdersService: PreOrdersService) {}

  @Post()
  @Roles('CONSUMER')
  @ApiOperation({ summary: 'Place a new pre-order on a harvest (CONSUMER only)' })
  create(
    @Req() req: { user: ActiveUser },
    @Body() dto: CreatePreOrderDto,
  ) {
    return this.preOrdersService.create(req.user.user_id, dto);
  }

  @Get()
  @ApiOperation({
    summary:
      'List pre-orders (CONSUMER sees their own; FARMER sees pre-orders on their harvests)',
  })
  findAll(@Req() req: { user: ActiveUser }) {
    return this.preOrdersService.findAllForUser(req.user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single pre-order by ID' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: ActiveUser },
  ) {
    return this.preOrdersService.findOne(id, req.user);
  }

  @Patch(':id')
  @ApiOperation({
    summary:
      'Update a pre-order (CONSUMER updates quantity/status; FARMER updates status)',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: ActiveUser },
    @Body() dto: UpdatePreOrderDto,
  ) {
    return this.preOrdersService.update(id, req.user, dto);
  }

  @Delete(':id')
  @Roles('CONSUMER')
  @ApiOperation({ summary: 'Delete a pre-order (CONSUMER owner only)' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: ActiveUser },
  ) {
    return this.preOrdersService.remove(id, req.user);
  }
}