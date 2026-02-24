import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../common/encryption/encryption.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private encryption: EncryptionService,
  ) { }

  async create(dto: CreateCustomerDto, userRole?: string) {
    try {
      const direccionEnc = this.encryption.encrypt(dto.direccion);
      const documentoEnc = this.encryption.encrypt(dto.documentoFiscal);

      const customer = await this.prisma.customer.create({
        data: {
          nombre: dto.nombre,
          email: dto.email,
          telefono: dto.telefono,
          direccion: direccionEnc.encrypted,
          direccionIv: direccionEnc.iv,
          direccionAuthTag: direccionEnc.authTag,
          documentoFiscal: documentoEnc.encrypted,
          documentoIv: documentoEnc.iv,
          documentoAuthTag: documentoEnc.authTag,
        },
      });

      return this.decryptCustomer(customer, userRole);
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException('Email ya registrado');
      }
      throw error;
    }
  }

  async findAll(page = 1, q?: string, userRole?: string) {
    const take = 10;
    const skip = (page - 1) * take;

    const where = q
      ? {
        OR: [
          { nombre: { contains: q } },
          { email: { contains: q } },
        ],
      }
      : {};

    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      total,
      page,
      data: data.map((c) => this.decryptCustomer(c, userRole)),
    };
  }

  async findOne(id: string, userRole?: string) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });

    if (!customer) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return this.decryptCustomer(customer, userRole);
  }

  async update(id: string, dto: UpdateCustomerDto, userRole?: string) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const direccionEnc = dto.direccion ? this.encryption.encrypt(dto.direccion) : null;
    const documentoEnc = dto.documentoFiscal ? this.encryption.encrypt(dto.documentoFiscal) : null;

    const updated = await this.prisma.customer.update({
      where: { id },
      data: {
        nombre: dto.nombre ?? undefined,
        email: dto.email ?? undefined,
        telefono: dto.telefono ?? undefined,
        direccion: direccionEnc?.encrypted ?? existing.direccion,
        direccionIv: direccionEnc?.iv ?? existing.direccionIv,
        direccionAuthTag: direccionEnc?.authTag ?? existing.direccionAuthTag,
        documentoFiscal: documentoEnc?.encrypted ?? existing.documentoFiscal,
        documentoIv: documentoEnc?.iv ?? existing.documentoIv,
        documentoAuthTag: documentoEnc?.authTag ?? existing.documentoAuthTag,
      },
    });

    return this.decryptCustomer(updated, userRole);
  }

  async remove(id: string) {
    const existing = await this.prisma.customer.findUnique({ where: { id } });

    if (!existing) {
      throw new NotFoundException('Cliente no encontrado');
    }

    await this.prisma.customer.delete({ where: { id } });

    return { message: 'Cliente eliminado correctamente' };
  }

  private decryptCustomer(customer: any, userRole?: string) {
    const isVisible = userRole === 'ADMIN';

    return {
      ...customer,
      direccion: isVisible
        ? this.encryption.decrypt(customer.direccion, customer.direccionIv, customer.direccionAuthTag)
        : '******** (Solo Admin)',
      documentoFiscal: isVisible
        ? this.encryption.decrypt(customer.documentoFiscal, customer.documentoIv, customer.documentoAuthTag)
        : '******** (Solo Admin)',
    };
  }
}
