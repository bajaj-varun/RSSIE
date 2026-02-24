import { Module } from '@nestjs/common';
import { TelemetryController } from './telemetry.controller';
import { TelemetryService } from './telemetry.service';
import { DataGeneratorService } from './data-generator.service';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [SearchModule],
  controllers: [TelemetryController],
  providers: [TelemetryService, DataGeneratorService]
})
export class TelemetryModule { }
