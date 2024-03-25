import { Test, TestingModule } from '@nestjs/testing';
import { ConverterController } from './converter.controller';
import { ConverterService } from './converter.service';

describe('ConverterController', () => {
  let convertedController: ConverterController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ConverterController],
      providers: [ConverterService],
    }).compile();

    convertedController = app.get<ConverterController>(ConverterController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(convertedController.convertInterface()).toBe('Hello World!');
    });
  });
});
