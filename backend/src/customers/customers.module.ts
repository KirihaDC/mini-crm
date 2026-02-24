import { Module } from '@nestjs/common';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { PrismaService } from '../prisma/prisma.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EncryptionModule } from '../common/encryption/encryption.module';

@Module({
  imports: [EncryptionModule],
  controllers: [CustomersController],
  providers: [
    CustomersService,
    PrismaService,
  ],
})
export class CustomersModule { }
