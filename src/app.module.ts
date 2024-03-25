import { Module } from '@nestjs/common';
import { ConverterController } from './converter/converter.controller';
import { ConverterService } from './converter/converter.service';

@Module({
  imports: [],
  controllers: [ConverterController],
  providers: [ConverterService],
})
export class AppModule {}
