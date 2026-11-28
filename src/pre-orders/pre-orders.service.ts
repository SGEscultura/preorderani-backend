import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePreOrderDto } from './dto/create-pre-order.dto';
import { UpdatePreOrderDto } from './dto/update-pre-order.dto';
import { ActiveUser } from '../harvests/harvests.service';

@Injectable()
export class PreOrdersService {
  constructor(private prisma: PrismaService) {}

  private readonly preOrderInclude = {
    consumer: {
      select: {
        user_id: true,
        user_name: true,
        user_email: true,
        user_phone: true,
        user_location: true,
      },
    },
    pre_order_status: true,
    harvest: {
      include: {
        crop: true,
        unit: true,
        harvest_status: true,
        farmer: {
          select: {
            user_id: true,
            user_name: true,
            user_location: true,
            user_phone: true,
          },
        },
      },
    },
  };

  async create(consumerId: number, dto: CreatePreOrderDto) {
    const harvest = await this.prisma.harvests.findUnique({
      where: { harvest_id: dto.harvest_id },
    });

    if (!harvest) {
      throw new BadRequestException('Invalid harvest_id');
    }

    if (Number(dto.pre_order_quantity) > Number(harvest.harvest_quantity)) {
      throw new BadRequestException(
        `Requested quantity (${dto.pre_order_quantity}) exceeds available harvest quantity (${harvest.harvest_quantity})`,
      );
    }

    let statusId = dto.pre_order_status_id;
    if (statusId !== undefined) {
      const status = await this.prisma.pre_order_statuses.findUnique({
        where: { pre_order_status_id: statusId },
      });
      if (!status) {
        throw new BadRequestException('Invalid pre_order_status_id');
      }
    } else {
      const defaultStatus = await this.prisma.pre_order_statuses.findFirst({
        orderBy: { pre_order_status_id: 'asc' },
      });
      if (!defaultStatus) {
        throw new BadRequestException('No pre-order statuses configured');
      }
      statusId = defaultStatus.pre_order_status_id;
    }

    return this.prisma.pre_orders.create({
      data: {
        harvest_id: dto.harvest_id,
        consumer_id: consumerId,
        pre_order_status_id: statusId,
        pre_order_quantity: dto.pre_order_quantity,
      },
      include: this.preOrderInclude,
    });
  }

  async findAllForUser(user: ActiveUser) {
    if (user.role === 'FARMER') {
      return this.prisma.pre_orders.findMany({
        where: {
          harvest: {
            farmer_id: user.user_id,
          },
        },
        include: this.preOrderInclude,
        orderBy: { created_at: 'desc' },
      });
    }

    return this.prisma.pre_orders.findMany({
      where: {
        consumer_id: user.user_id,
      },
      include: this.preOrderInclude,
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(preOrderId: number, user: ActiveUser) {
    const preOrder = await this.prisma.pre_orders.findUnique({
      where: { pre_order_id: preOrderId },
      include: this.preOrderInclude,
    });

    if (!preOrder) {
      throw new NotFoundException(`Pre-order #${preOrderId} not found`);
    }

    const isConsumerOwner = preOrder.consumer_id === user.user_id;
    const isHarvestFarmer = preOrder.harvest.farmer_id === user.user_id;

    if (!isConsumerOwner && !isHarvestFarmer) {
      throw new ForbiddenException('You do not have access to this pre-order');
    }

    return preOrder;
  }

  async update(preOrderId: number, user: ActiveUser, dto: UpdatePreOrderDto) {
    const preOrder = await this.findOne(preOrderId, user);

    const isConsumerOwner = preOrder.consumer_id === user.user_id;
    const isHarvestFarmer = preOrder.harvest.farmer_id === user.user_id;

    if (dto.pre_order_quantity !== undefined) {
      if (!isConsumerOwner) {
        throw new ForbiddenException(
          'Only the consumer who placed the pre-order can change its quantity',
        );
      }
      if (
        Number(dto.pre_order_quantity) >
        Number(preOrder.harvest.harvest_quantity)
      ) {
        throw new BadRequestException(
          `Requested quantity (${dto.pre_order_quantity}) exceeds available harvest quantity (${preOrder.harvest.harvest_quantity})`,
        );
      }
    }

    if (dto.pre_order_status_id !== undefined) {
      if (!isConsumerOwner && !isHarvestFarmer) {
        throw new ForbiddenException(
          'You cannot update the status of this pre-order',
        );
      }
      const status = await this.prisma.pre_order_statuses.findUnique({
        where: { pre_order_status_id: dto.pre_order_status_id },
      });
      if (!status) {
        throw new BadRequestException('Invalid pre_order_status_id');
      }
    }

    return this.prisma.pre_orders.update({
      where: { pre_order_id: preOrderId },
      data: {
        ...(dto.pre_order_quantity !== undefined && {
          pre_order_quantity: dto.pre_order_quantity,
        }),
        ...(dto.pre_order_status_id !== undefined && {
          pre_order_status_id: dto.pre_order_status_id,
        }),
      },
      include: this.preOrderInclude,
    });
  }

  async remove(preOrderId: number, user: ActiveUser) {
    const preOrder = await this.findOne(preOrderId, user);

    if (preOrder.consumer_id !== user.user_id) {
      throw new ForbiddenException('You can only delete your own pre-orders');
    }

    await this.prisma.pre_orders.delete({
      where: { pre_order_id: preOrderId },
    });

    return { deleted: true, pre_order_id: preOrderId };
  }
}