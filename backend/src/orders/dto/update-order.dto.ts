import { IsOptional, IsString } from 'class-validator';

export class UpdateOrderDto {
  @IsOptional()
  @IsString()
  estatus?: 'CREADA' | 'PAGADA' | 'CANCELADA';

  @IsOptional()
  @IsString()
  notasInternas?: string;
}
