import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { ActiveUser } from '../harvests/harvests.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  private readonly paymentInclude = {
    payment_method: true,
    payment_status: true,
    invoice: true,
    payment_logs: {
      include: {
        payment_method: true,
        payment_status: true,
        changed_by_user: {
          select: {
            user_id: true,
            user_name: true,
            user_email: true,
          },
        },
      },
      orderBy: { logged_at: 'desc' as const },
    },
    pre_order: {
      include: {
        consumer: {
          select: {
            user_id: true,
            user_name: true,
            user_email: true,
          },
        },
        pre_order_status: true,
        harvest: {
          include: {
            crop: true,
            unit: true,
            farmer: {
              select: {
                user_id: true,
                user_name: true,
                user_email: true,
              },
            },
          },
        },
      },
    },
  };

  private generateInvoiceNumber(paymentId: number): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const paddedId = String(paymentId).padStart(5, '0');
    return `INV-${datePart}-${paddedId}`;
  }

  async create(consumerId: number, dto: CreatePaymentDto) {
    const preOrder = await this.prisma.pre_orders.findUnique({
      where: { pre_order_id: dto.pre_order_id },
      include: {
        harvest: true,
        payment: true,
      },
    });

    if (!preOrder) {
      throw new BadRequestException('Invalid pre_order_id');
    }

    if (preOrder.consumer_id !== consumerId) {
      throw new ForbiddenException(
        'You can only submit payment for your own pre-orders',
      );
    }

    if (preOrder.payment) {
      throw new ConflictException(
        `Pre-order #${dto.pre_order_id} already has a payment record`,
      );
    }

    const paymentMethod = await this.prisma.payment_methods.findUnique({
      where: { payment_method_id: dto.payment_method_id },
    });
    if (!paymentMethod) {
      throw new BadRequestException('Invalid payment_method_id');
    }

    let statusRecord;
    if (dto.payment_status_id !== undefined) {
      statusRecord = await this.prisma.payment_statuses.findUnique({
        where: { payment_status_id: dto.payment_status_id },
      });
      if (!statusRecord) {
        throw new BadRequestException('Invalid payment_status_id');
      }
    } else {
      statusRecord = await this.prisma.payment_statuses.findFirst({
        orderBy: { payment_status_id: 'asc' },
      });
      if (!statusRecord) {
        throw new BadRequestException('No payment statuses configured');
      }
    }

    const computedAmount =
      Number(preOrder.pre_order_quantity) *
      Number(preOrder.harvest.harvest_price_per_unit);

    const isPaid =
      statusRecord.payment_status_name.toUpperCase() === 'PAID';

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payments.create({
        data: {
          pre_order_id: dto.pre_order_id,
          payment_method_id: dto.payment_method_id,
          payment_status_id: statusRecord.payment_status_id,
          payment_amount: computedAmount.toFixed(2),
          payment_reference: dto.payment_reference?.trim(),
          paid_at: isPaid ? new Date() : null,
        },
      });

      await tx.invoices.create({
        data: {
          payment_id: payment.payment_id,
          invoice_number: this.generateInvoiceNumber(payment.payment_id),
        },
      });

      await tx.payment_logs.create({
        data: {
          payment_id: payment.payment_id,
          payment_method_id: dto.payment_method_id,
          payment_status_id: statusRecord.payment_status_id,
          changed_by: consumerId,
          log_note:
            dto.log_note?.trim() ||
            `Payment created (${statusRecord.payment_status_name})`,
        },
      });

      return tx.payments.findUnique({
        where: { payment_id: payment.payment_id },
        include: this.paymentInclude,
      });
    });
  }

  async findAllForUser(user: ActiveUser) {
    if (user.role === 'FARMER') {
      return this.prisma.payments.findMany({
        where: {
          pre_order: {
            harvest: {
              farmer_id: user.user_id,
            },
          },
        },
        include: this.paymentInclude,
        orderBy: { created_at: 'desc' },
      });
    }

    return this.prisma.payments.findMany({
      where: {
        pre_order: {
          consumer_id: user.user_id,
        },
      },
      include: this.paymentInclude,
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(paymentId: number, user: ActiveUser) {
    const payment = await this.prisma.payments.findUnique({
      where: { payment_id: paymentId },
      include: this.paymentInclude,
    });

    if (!payment) {
      throw new NotFoundException(`Payment #${paymentId} not found`);
    }

    const isConsumerOwner = payment.pre_order.consumer_id === user.user_id;
    const isHarvestFarmer =
      payment.pre_order.harvest.farmer_id === user.user_id;

    if (!isConsumerOwner && !isHarvestFarmer) {
      throw new ForbiddenException('You do not have access to this payment');
    }

    return payment;
  }

  async updateStatus(
    paymentId: number,
    user: ActiveUser,
    dto: UpdatePaymentStatusDto,
  ) {
    const payment = await this.findOne(paymentId, user);

    const statusRecord = await this.prisma.payment_statuses.findUnique({
      where: { payment_status_id: dto.payment_status_id },
    });
    if (!statusRecord) {
      throw new BadRequestException('Invalid payment_status_id');
    }

    const methodId = dto.payment_method_id ?? payment.payment_method_id;
    if (dto.payment_method_id !== undefined) {
      const methodRecord = await this.prisma.payment_methods.findUnique({
        where: { payment_method_id: dto.payment_method_id },
      });
      if (!methodRecord) {
        throw new BadRequestException('Invalid payment_method_id');
      }
    }

    const isPaid =
      statusRecord.payment_status_name.toUpperCase() === 'PAID';

    return this.prisma.$transaction(async (tx) => {
      await tx.payments.update({
        where: { payment_id: paymentId },
        data: {
          payment_status_id: dto.payment_status_id,
          payment_method_id: methodId,
          ...(dto.payment_reference !== undefined && {
            payment_reference: dto.payment_reference.trim(),
          }),
          ...(isPaid && !payment.paid_at && { paid_at: new Date() }),
        },
      });

      await tx.payment_logs.create({
        data: {
          payment_id: paymentId,
          payment_method_id: methodId,
          payment_status_id: dto.payment_status_id,
          changed_by: user.user_id,
          log_note:
            dto.log_note?.trim() ||
            `Payment status updated to ${statusRecord.payment_status_name}`,
        },
      });

      return tx.payments.findUnique({
        where: { payment_id: paymentId },
        include: this.paymentInclude,
      });
    });
  }
}