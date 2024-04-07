import { Body, Controller, Post } from '@nestjs/common';
import { ConverterService } from './converter.service';
import { ConverterRequestDto } from './dto';

@Controller('convert')
export class ConverterController {
  constructor(private readonly convertedService: ConverterService) {}

  @Post()
  convertInterface(@Body() dto: ConverterRequestDto): string {
    return this.convertedService.convertInterface(dto);
  }
}
