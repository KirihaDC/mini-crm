import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger('ErrorHandler');

    constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

    catch(exception: unknown, host: ArgumentsHost): void {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();

        const httpStatus =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const responseBody = {
            statusCode: httpStatus,
            timestamp: new Date().toISOString(),
            path: httpAdapter.getRequestUrl(ctx.getRequest()),
            message: (exception as any)?.message || 'Internal server error',
        };

        this.logger.error(
            `[${httpStatus}] ${httpAdapter.getRequestMethod(ctx.getRequest())} ${httpAdapter.getRequestUrl(ctx.getRequest())} - Error: ${responseBody.message}`,
            exception instanceof Error ? exception.stack : '',
        );

        httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
}
