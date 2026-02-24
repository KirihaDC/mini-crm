import { Controller, Post, Body, Get, Req } from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { Public } from './decorators/public.decorator'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@ApiTags('auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) { }

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password, dto.nombre, dto.role)
  }

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password)
  }

  @Public()
  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.auth.refresh(refreshToken)
  }

  @Get('me')
  getMe(@Req() req: any) {
    return req.user;
  }
}
