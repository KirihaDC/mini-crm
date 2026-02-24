import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'admin@test.com', description: 'Correo electrónico' })
    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    @IsNotEmpty({ message: 'El correo electrónico es requerido' })
    email: string;

    @ApiProperty({ example: '12345678', description: 'Contraseña (mín. 6 caracteres)' })
    @IsString()
    @IsNotEmpty({ message: 'La contraseña es requerida' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;

    @ApiProperty({ example: 'Admin', description: 'Nombre completo' })
    @IsString()
    @IsNotEmpty({ message: 'El nombre es requerido' })
    nombre: string;

    @ApiProperty({ example: 'admin', description: 'Rol del usuario', required: false })
    @IsString()
    @IsOptional()
    role?: string;
}
