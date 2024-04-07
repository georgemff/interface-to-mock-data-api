import { Body, Controller, Get, Post, StreamableFile } from '@nestjs/common';
import { ConverterService } from './converter.service';
import { ConverterRequestDto } from './dto';
import { createReadStream } from 'fs';
import { join } from 'path';

@Controller("convert")
export class ConverterController {
  constructor(private readonly convertedService: ConverterService) {}

  @Post()
  convertInterface(@Body() dto: ConverterRequestDto): string {
    return this.convertedService.convertInterface(dto);
  }

  @Get()
  schemas(): any {
    const file = createReadStream(join(process.cwd(), 'schema.json'));
    return new StreamableFile(file);
  }
}
