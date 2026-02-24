import { IsOptional, IsString, IsDateString } from 'class-validator';

export class GetOrdersFilterDto {
    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsDateString()
    from?: string;

    @IsOptional()
    @IsDateString()
    to?: string;

    @IsOptional()
    page?: string;
}
