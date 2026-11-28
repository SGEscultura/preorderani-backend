import {
  Body,
  Controller,
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
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ActiveUser } from '../harvests/harvests.service';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post()
  @Roles('CONSUMER')
  @ApiOperation({
    summary:
      'Submit payment for a pre-order, auto-generating an invoice and log entry (CONSUMER only)',
  })
  create(
    @Req() req: { user: ActiveUser },
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.create(req.user.user_id, dto);
  }

  @Get()
  @ApiOperation({
    summary:
      'List payments (CONSUMER sees their own; FARMER sees payments on their harvests)',
  })
  findAll(@Req() req: { user: ActiveUser }) {
    return this.paymentsService.findAllForUser(req.user);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single payment with its invoice and payment logs',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: ActiveUser },
  ) {
    return this.paymentsService.findOne(id, req.user);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary:
      'Update payment status/reference and append an entry to payment_logs',
  })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: ActiveUser },
    @Body() dto: UpdatePaymentStatusDto,
  ) {
    return this.paymentsService.updateStatus(id, req.user, dto);
  }
}