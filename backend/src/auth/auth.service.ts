import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService
  ) { }

  async register(email: string, password: string, nombre: string, role?: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } })
    if (existing) throw new BadRequestException('Email ya registrado')

    const hashed = await bcrypt.hash(password, 10)

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashed,
        nombre,
        role: (role || 'USER').toUpperCase()
      }
    })

    return { message: 'Usuario creado' }
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new UnauthorizedException('Credenciales inválidas')

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) throw new UnauthorizedException('Credenciales inválidas')

    const accessToken = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role
    })

    const refreshTokenRaw = randomUUID()
    const refreshTokenHash = await bcrypt.hash(refreshTokenRaw, 10)

    const record = await this.prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    return {
      accessToken,
      refreshToken: `${record.id}.${refreshTokenRaw}`
    }
  }

  async refresh(token: string) {
    if (!token) throw new UnauthorizedException('Token requerido')

    const [id, raw] = token.split('.')
    if (!id || !raw) throw new UnauthorizedException('Formato de token inválido')

    const record = await this.prisma.refreshToken.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Token expirado o inválido')
    }

    const valid = await bcrypt.compare(raw, record.tokenHash)
    if (!valid) throw new UnauthorizedException('Token inválido')

    await this.prisma.refreshToken.delete({ where: { id: record.id } })

    const user = record.user
    const accessToken = this.jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role
    })

    const newRaw = randomUUID()
    const newHash = await bcrypt.hash(newRaw, 10)
    const newRecord = await this.prisma.refreshToken.create({
      data: {
        tokenHash: newHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    })

    return {
      accessToken,
      refreshToken: `${newRecord.id}.${newRaw}`
    }
  }
}
