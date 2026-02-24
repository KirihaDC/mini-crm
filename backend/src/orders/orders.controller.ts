import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetOrdersFilterDto } from './dto/get-orders-filter.dto';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private service: OrdersService) { }

  @Get()
  findAll(@Query() query: GetOrdersFilterDto) {
    return this.service.findAll(
      query.status,
      query.from,
      query.to,
      query.page ? Number(query.page) : 1,
    );
  }

  @Post('customer/:id')
  create(@Param('id') clienteId: string, @Body() body: CreateOrderDto) {
    return this.service.create(clienteId, body);
  }

  @Get('customer/:id')
  findAllByCustomer(@Param('id') clienteId: string) {
    return this.service.findAllByCustomer(clienteId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: UpdateOrderStatusDto, @Req() req: any) {
    return this.service.updateStatus(id, body.estatus, req.user.role);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
