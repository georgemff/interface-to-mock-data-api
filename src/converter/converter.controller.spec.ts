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
    it('should return array of {name: "Lorem Ipsum"}', () => {
      const req = {
        count: 1,
        interface: "T{name:string,}"
      }

      const expectedResponse = [{name: 'Lorem Ipsum'}]
      expect(convertedController.convertInterface(req)).toEqual(expectedResponse);
    });
  });
});
