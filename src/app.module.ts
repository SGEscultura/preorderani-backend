import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HarvestsModule } from './harvests/harvests.module';
import { PreOrdersModule } from './pre-orders/pre-orders.module';
import { PaymentsModule } from './payments/payments.module';
import { LookupsModule } from './lookups/lookups.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    HarvestsModule,
    PreOrdersModule,
    PaymentsModule,
    LookupsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}