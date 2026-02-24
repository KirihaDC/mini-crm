import { IsNotEmpty, IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsString()
  folio: string;

  @IsNotEmpty()
  @IsNumber()
  monto: number;

  @IsNotEmpty()
  @IsString()
  @IsIn(['MXN', 'USD'])
  moneda: string;

  @IsOptional()
  @IsString()
  estatus?: 'CREADA' | 'PAGADA' | 'CANCELADA';

  @IsOptional()
  @IsString()
  notasInternas?: string;
}
