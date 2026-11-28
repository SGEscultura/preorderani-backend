import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // 1. Roles
  for (const role_name of ['FARMER', 'CONSUMER']) {
    await prisma.roles.upsert({
      where: { role_name },
      update: {},
      create: { role_name },
    });
  }

  // 2. Units
  const unitsData = [
    { unit_code: 'kg', unit_label: 'Kilogram' },
    { unit_code: 'pc', unit_label: 'Piece' },
    { unit_code: 'sack', unit_label: 'Sack' },
  ];
  for (const unit of unitsData) {
    await prisma.units.upsert({
      where: { unit_code: unit.unit_code },
      update: { unit_label: unit.unit_label },
      create: unit,
    });
  }

  const kgUnit = await prisma.units.findUniqueOrThrow({ where: { unit_code: 'kg' } });
  const sackUnit = await prisma.units.findUniqueOrThrow({ where: { unit_code: 'sack' } });
  const pcUnit = await prisma.units.findUniqueOrThrow({ where: { unit_code: 'pc' } });

  // 3. Crops
  const cropsData = [
    { crop_name: 'Tomato', default_unit_id: kgUnit.unit_id },
    { crop_name: 'Rice', default_unit_id: sackUnit.unit_id },
    { crop_name: 'Corn', default_unit_id: sackUnit.unit_id },
    { crop_name: 'Eggplant', default_unit_id: kgUnit.unit_id },
    { crop_name: 'Banana', default_unit_id: pcUnit.unit_id },
  ];
  for (const crop of cropsData) {
    await prisma.crops.upsert({
      where: { crop_name: crop.crop_name },
      update: { default_unit_id: crop.default_unit_id },
      create: crop,
    });
  }

  // 4. Harvest Statuses
  for (const harvest_status_name of ['UPCOMING', 'READY', 'COMPLETED', 'CANCELLED']) {
    await prisma.harvest_statuses.upsert({
      where: { harvest_status_name },
      update: {},
      create: { harvest_status_name },
    });
  }

  // 5. Pre-Order Statuses
  for (const pre_order_status_name of ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']) {
    await prisma.pre_order_statuses.upsert({
      where: { pre_order_status_name },
      update: {},
      create: { pre_order_status_name },
    });
  }

  // 6. Payment Methods
  for (const payment_method_name of ['CASH', 'GCASH']) {
    await prisma.payment_methods.upsert({
      where: { payment_method_name },
      update: {},
      create: { payment_method_name },
    });
  }

  // 7. Payment Statuses
  for (const payment_status_name of ['PENDING', 'PAID', 'FAILED', 'REFUNDED']) {
    await prisma.payment_statuses.upsert({
      where: { payment_status_name },
      update: {},
      create: { payment_status_name },
    });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });