import {
  Injectable,
  Logger,
  OnModuleInit,
  OnApplicationShutdown,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnApplicationShutdown
{
  private readonly maxRetries = 5;
  private readonly retryDelay = 2000;

  constructor() {
    super();
    this.setupProcessListeners();
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onApplicationShutdown() {
    await this.$disconnect();
    Logger.log('Disconnected from DB');
  }

  private setupProcessListeners() {
    process.on('uncaughtException', (err) => {
      Logger.error(`Uncaught Exception: ${err.message}`);
    });

    process.on('SIGINT', async () => {
      Logger.log('SIGINT received. Closing Prisma connection...');
      await this.$disconnect();
      process.exit(0);
    });

    process.on('exit', async (code) => {
      Logger.log(
        `Process exiting with code ${code}. Closing Prisma connection...`,
      );
      await this.$disconnect();
    });
  }

  private async connectWithRetry(retries = 0): Promise<void> {
    try {
      await this.$connect();
      Logger.log('Connected to DB');
    } catch (error) {
      Logger.error(`Database connection failed: ${error.message}`);
      if (retries < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retries); // Exponential backoff
        Logger.warn(
          `Retrying connection in ${delay}ms... (Attempt ${retries + 1})`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        await this.connectWithRetry(retries + 1);
      } else {
        Logger.error(
          'Max retries reached. Could not reconnect to the database.',
        );
        throw error;
      }
    }
  }
}
