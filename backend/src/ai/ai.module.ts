import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { SearchModule } from '../search/search.module';
import { ConfigModule } from '@nestjs/config';
import { AiController } from './ai.controller';

@Module({
  imports: [SearchModule, ConfigModule],
  providers: [AiService],
  exports: [AiService],
  controllers: [AiController],
})
export class AiModule { }
