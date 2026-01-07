import { Controller, Post, Get, Body, UseInterceptors, UploadedFile, StreamableFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelService } from './excel.service';
import { Stream } from 'stream';

@Controller('excel')
export class ExcelController {
  constructor(private readonly excelService: ExcelService) {}

  @Post('import/products')
  @UseInterceptors(FileInterceptor('file'))
  importProducts(@UploadedFile() file: Express.Multer.File) {
    return this.excelService.importProducts(file.buffer);
  }

  @Get('export/inventory')
  async exportInventory() {
    const buffer = await this.excelService.exportInventory();
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="inventory.xlsx"',
    });
  }

  @Get('export/products')
  async exportProducts() {
    const buffer = await this.excelService.exportProducts();
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="products.xlsx"',
    });
  }
}
