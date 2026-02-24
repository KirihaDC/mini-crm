import { IsNotEmpty, IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsIn(['CREADA', 'PAGADA', 'CANCELADA'])
  estatus: 'CREADA' | 'PAGADA' | 'CANCELADA';
}
