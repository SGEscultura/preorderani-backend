import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { HarvestsModule } from './harvests/harvests.module';
import { PreOrdersModule } from './pre-orders/pre-orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    HarvestsModule,
    PreOrdersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}