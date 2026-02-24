import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
  ) { }

  async create(customerId: string, dto: CreateOrderDto) {
    let notasEnc: {
      encrypted: string;
      iv: string;
      authTag: string;
    } | null = null;

    if (dto.notasInternas) {
      notasEnc = this.encryption.encrypt(dto.notasInternas);
    }

    const order = await this.prisma.order.create({
      data: {
        clienteId: customerId,
        folio: dto.folio,
        monto: dto.monto,
        moneda: dto.moneda,
        estatus: dto.estatus ?? 'CREADA',
        notasInternas: notasEnc?.encrypted,
        notasIv: notasEnc?.iv,
        notasAuthTag: notasEnc?.authTag,
      },
    });

    return this.decryptOrder(order);
  }

  async findAll(status?: string, from?: string, to?: string, page = 1) {
    const take = 10;
    const skip = (page - 1) * take;

    const where: any = {};

    if (status) {
      where.estatus = status;
    }

    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: { customer: true },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      total,
      page,
      data: data.map((o) => this.decryptOrder(o)),
    };
  }

  async findAllByCustomer(customerId: string) {
    const orders = await this.prisma.order.findMany({
      where: { clienteId: customerId },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => this.decryptOrder(o));
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Orden no encontrada');

    return this.decryptOrder(order);
  }

  async updateStatus(id: string, status: string, userRole: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Orden no encontrada');

    if (order.estatus === 'CANCELADA') {
      throw new BadRequestException('No se puede modificar una orden cancelada');
    }

    if (status === 'CANCELADA' && userRole !== 'ADMIN') {
      throw new BadRequestException('Solo un administrador puede cancelar órdenes');
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { estatus: status },
    });

    return this.decryptOrder(updated);
  }

  async remove(id: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Orden no encontrada');

    await this.prisma.order.delete({ where: { id } });
    return { message: 'Orden eliminada correctamente' };
  }

  private decryptOrder(order: any) {
    return {
      ...order,
      notasInternas: order.notasInternas
        ? this.encryption.decrypt(
          order.notasInternas,
          order.notasIv,
          order.notasAuthTag,
        )
        : null,
    };
  }
}
