import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LookupsService {
  constructor(private prisma: PrismaService) {}

  getCrops() {
    return this.prisma.crops.findMany({
      orderBy: { crop_name: 'asc' },
    });
  }

  getUnits() {
    return this.prisma.units.findMany({
      orderBy: { unit_id: 'asc' },
    });
  }

  getRoles() {
    return this.prisma.roles.findMany({
      orderBy: { role_id: 'asc' },
    });
  }

  getHarvestStatuses() {
    return this.prisma.harvest_statuses.findMany({
      orderBy: { harvest_status_id: 'asc' },
    });
  }

  getPreOrderStatuses() {
    return this.prisma.pre_order_statuses.findMany({
      orderBy: { pre_order_status_id: 'asc' },
    });
  }

  getPaymentMethods() {
    return this.prisma.payment_methods.findMany({
      orderBy: { payment_method_id: 'asc' },
    });
  }

  getPaymentStatuses() {
    return this.prisma.payment_statuses.findMany({
      orderBy: { payment_status_id: 'asc' },
    });
  }
}