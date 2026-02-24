import { Controller, Get, Post, Body, Param, Query, Patch, Delete, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@ApiTags('customers')
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private service: CustomersService) { }

  @Post()
  create(@Body() body: CreateCustomerDto, @Req() req: any) {
    return this.service.create(body, req.user.role);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('q') q?: string, @Req() req?: any) {
    return this.service.findAll(page ? Number(page) : 1, q, req?.user?.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req?: any) {
    return this.service.findOne(id, req?.user?.role);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateCustomerDto, @Req() req: any) {
    return this.service.update(id, body, req.user.role);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
