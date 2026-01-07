import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { QuotationService } from './quotation.service';
import { QuotationInventoryService } from './quotation-inventory.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { SendEmailDto } from './dto/send-email.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { FindQuotationsDto } from './dto/find-quotations.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('quotations')
@UseGuards(JwtAuthGuard)
export class QuotationController {
  constructor(
    private readonly quotationService: QuotationService,
    private readonly inventoryService: QuotationInventoryService,
  ) {}

  @Post()
  create(@Body() createQuotationDto: CreateQuotationDto) {
    return this.quotationService.create(createQuotationDto);
  }

  @Get()
  findAll(@Query() filters?: FindQuotationsDto) {
    return this.quotationService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quotationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuotationDto: UpdateQuotationDto) {
    return this.quotationService.update(id, updateQuotationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.quotationService.delete(id);
  }

  @Get(':id/pdf')
  async getPDF(@Param('id') id: string) {
    const pdfBuffer = await this.quotationService.generatePDF(id);
    const quotation = await this.quotationService.findOne(id);

    return new StreamableFile(pdfBuffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${quotation.quotationNumber}.pdf"`,
    });
  }

  @Post(':id/send-email')
  sendByEmail(@Param('id') id: string, @Body() sendEmailDto: SendEmailDto) {
    return this.quotationService.sendByEmail(id, sendEmailDto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto) {
    return this.quotationService.updateStatus(id, updateStatusDto);
  }

  @Post(':id/reserve-stock')
  async reserveStock(
    @Param('id') id: string,
    @Body('performedBy') performedBy: string,
  ) {
    return this.inventoryService.reserveStock(id, performedBy);
  }

  @Post(':id/release-stock')
  async releaseStock(
    @Param('id') id: string,
    @Body('performedBy') performedBy: string,
  ) {
    return this.inventoryService.releaseStock(id, performedBy);
  }

  @Get(':id/stock-availability')
  async checkStockAvailability(@Param('id') id: string) {
    return this.inventoryService.checkStockAvailability(id);
  }
}
