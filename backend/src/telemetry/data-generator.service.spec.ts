import { Test, TestingModule } from '@nestjs/testing';
import { DataGeneratorService } from './data-generator.service';

describe('DataGeneratorService', () => {
  let service: DataGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataGeneratorService],
    }).compile();

    service = module.get<DataGeneratorService>(DataGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
