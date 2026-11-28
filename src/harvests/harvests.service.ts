import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { UpdateHarvestDto } from './dto/update-harvest.dto';

export interface ActiveUser {
  user_id: number;
  user_name: string;
  user_email: string;
  role_id: number;
  role: string;
}

@Injectable()
export class HarvestsService {
  constructor(private prisma: PrismaService) {}

  private readonly harvestInclude = {
    farmer: {
      select: {
        user_id: true,
        user_name: true,
        user_location: true,
        user_phone: true,
      },
    },
    crop: true,
    unit: true,
    harvest_status: true,
  };

  async create(farmerId: number, dto: CreateHarvestDto) {
    const [crop, unit] = await Promise.all([
      this.prisma.crops.findUnique({ where: { crop_id: dto.crop_id } }),
      this.prisma.units.findUnique({ where: { unit_id: dto.unit_id } }),
    ]);

    if (!crop) {
      throw new BadRequestException('Invalid crop_id');
    }
    if (!unit) {
      throw new BadRequestException('Invalid unit_id');
    }

    let statusId = dto.harvest_status_id;
    if (statusId !== undefined) {
      const status = await this.prisma.harvest_statuses.findUnique({
        where: { harvest_status_id: statusId },
      });
      if (!status) {
        throw new BadRequestException('Invalid harvest_status_id');
      }
    } else {
      const defaultStatus = await this.prisma.harvest_statuses.findFirst({
        orderBy: { harvest_status_id: 'asc' },
      });
      if (!defaultStatus) {
        throw new BadRequestException('No harvest statuses configured');
      }
      statusId = defaultStatus.harvest_status_id;
    }

    return this.prisma.harvests.create({
      data: {
        farmer_id: farmerId,
        crop_id: dto.crop_id,
        unit_id: dto.unit_id,
        harvest_status_id: statusId,
        harvest_quantity: dto.harvest_quantity,
        harvest_price_per_unit: dto.harvest_price_per_unit,
        harvest_date: new Date(dto.harvest_date),
        harvest_location: dto.harvest_location.trim(),
        harvest_description: dto.harvest_description?.trim(),
      },
      include: this.harvestInclude,
    });
  }

  async findAll() {
    return this.prisma.harvests.findMany({
      include: this.harvestInclude,
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(harvestId: number) {
    const harvest = await this.prisma.harvests.findUnique({
      where: { harvest_id: harvestId },
      include: this.harvestInclude,
    });

    if (!harvest) {
      throw new NotFoundException(`Harvest #${harvestId} not found`);
    }

    return harvest;
  }

  async update(harvestId: number, user: ActiveUser, dto: UpdateHarvestDto) {
    const harvest = await this.findOne(harvestId);

    if (harvest.farmer_id !== user.user_id) {
      throw new ForbiddenException('You can only update your own harvests');
    }

    if (dto.crop_id !== undefined) {
      const crop = await this.prisma.crops.findUnique({
        where: { crop_id: dto.crop_id },
      });
      if (!crop) {
        throw new BadRequestException('Invalid crop_id');
      }
    }

    if (dto.unit_id !== undefined) {
      const unit = await this.prisma.units.findUnique({
        where: { unit_id: dto.unit_id },
      });
      if (!unit) {
        throw new BadRequestException('Invalid unit_id');
      }
    }

    if (dto.harvest_status_id !== undefined) {
      const status = await this.prisma.harvest_statuses.findUnique({
        where: { harvest_status_id: dto.harvest_status_id },
      });
      if (!status) {
        throw new BadRequestException('Invalid harvest_status_id');
      }
    }

    return this.prisma.harvests.update({
      where: { harvest_id: harvestId },
      data: {
        ...(dto.crop_id !== undefined && { crop_id: dto.crop_id }),
        ...(dto.unit_id !== undefined && { unit_id: dto.unit_id }),
        ...(dto.harvest_status_id !== undefined && {
          harvest_status_id: dto.harvest_status_id,
        }),
        ...(dto.harvest_quantity !== undefined && {
          harvest_quantity: dto.harvest_quantity,
        }),
        ...(dto.harvest_price_per_unit !== undefined && {
          harvest_price_per_unit: dto.harvest_price_per_unit,
        }),
        ...(dto.harvest_date !== undefined && {
          harvest_date: new Date(dto.harvest_date),
        }),
        ...(dto.harvest_location !== undefined && {
          harvest_location: dto.harvest_location.trim(),
        }),
        ...(dto.harvest_description !== undefined && {
          harvest_description: dto.harvest_description.trim(),
        }),
      },
      include: this.harvestInclude,
    });
  }

  async remove(harvestId: number, user: ActiveUser) {
    const harvest = await this.findOne(harvestId);

    if (harvest.farmer_id !== user.user_id) {
      throw new ForbiddenException('You can only delete your own harvests');
    }

    await this.prisma.harvests.delete({
      where: { harvest_id: harvestId },
    });

    return { deleted: true, harvest_id: harvestId };
  }
}