import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LookupsService } from './lookups.service';

@ApiTags('Lookups')
@Controller('lookups')
export class LookupsController {
  constructor(private lookupsService: LookupsService) {}

  @Get('crops')
  @ApiOperation({ summary: 'List all available crops' })
  getCrops() {
    return this.lookupsService.getCrops();
  }

  @Get('units')
  @ApiOperation({ summary: 'List all measurement units' })
  getUnits() {
    return this.lookupsService.getUnits();
  }

  @Get('roles')
  @ApiOperation({ summary: 'List all user roles' })
  getRoles() {
    return this.lookupsService.getRoles();
  }

  @Get('harvest-statuses')
  @ApiOperation({ summary: 'List all harvest statuses' })
  getHarvestStatuses() {
    return this.lookupsService.getHarvestStatuses();
  }

  @Get('pre-order-statuses')
  @ApiOperation({ summary: 'List all pre-order statuses' })
  getPreOrderStatuses() {
    return this.lookupsService.getPreOrderStatuses();
  }

  @Get('payment-methods')
  @ApiOperation({ summary: 'List all payment methods' })
  getPaymentMethods() {
    return this.lookupsService.getPaymentMethods();
  }

  @Get('payment-statuses')
  @ApiOperation({ summary: 'List all payment statuses' })
  getPaymentStatuses() {
    return this.lookupsService.getPaymentStatuses();
  }
}