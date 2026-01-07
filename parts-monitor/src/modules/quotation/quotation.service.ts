import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Quotation } from './entities/quotation.entity';
import { QuotationItem } from './entities/quotation-item.entity';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { PDFGeneratorService } from './pdf-generator.service';
import { SendEmailDto } from './dto/send-email.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { FindQuotationsDto } from './dto/find-quotations.dto';
import { EmailService } from '../notification/email.service';

@Injectable()
export class QuotationService {
  private readonly logger = new Logger(QuotationService.name);

  constructor(
    @InjectRepository(Quotation)
    private quotationRepo: Repository<Quotation>,
    @InjectRepository(QuotationItem)
    private itemRepo: Repository<QuotationItem>,
    private pdfGenerator: PDFGeneratorService,
    private emailService: EmailService,
  ) {}

  async create(dto: CreateQuotationDto) {
    const quotationNumber = await this.generateQuotationNumber();

    const { subtotal, taxAmount, totalAmount } = this.calculateAmounts(
      dto.items,
      dto.taxRate || 10,
    );

    const quotation = this.quotationRepo.create({
      quotationNumber,
      customerId: dto.customerId,
      title: dto.title,
      quotationDate: dto.quotationDate || new Date(),
      validUntil: dto.validUntil || this.getDefaultValidDate(),
      status: 'draft',
      subtotal,
      taxRate: dto.taxRate || 10,
      taxAmount,
      totalAmount,
      notes: dto.notes,
      terms: dto.terms || this.getDefaultTerms(),
      createdBy: dto.createdBy,
    });

    const savedQuotation = await this.quotationRepo.save(quotation);

    const items = dto.items.map((item, index) =>
      this.itemRepo.create({
        quotationId: savedQuotation.id,
        productId: item.productId,
        lineNumber: index + 1,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount || 0,
        amount: this.calculateItemAmount(
          item.quantity,
          item.unitPrice,
          item.discount,
        ),
        memo: item.memo,
      }),
    );

    await this.itemRepo.save(items);

    this.logger.log(`Quotation created: ${quotationNumber}`);

    return this.findOne(savedQuotation.id);
  }

  async findAll(filters?: FindQuotationsDto) {
    const query = this.quotationRepo.createQueryBuilder('quotation')
      .leftJoinAndSelect('quotation.customer', 'customer')
      .leftJoinAndSelect('quotation.items', 'items');

    if (filters?.status) {
      query.andWhere('quotation.status = :status', { status: filters.status });
    }

    if (filters?.customerId) {
      query.andWhere('quotation.customerId = :customerId', {
        customerId: filters.customerId
      });
    }

    if (filters?.fromDate) {
      query.andWhere('quotation.quotationDate >= :fromDate', {
        fromDate: filters.fromDate
      });
    }

    if (filters?.toDate) {
      query.andWhere('quotation.quotationDate <= :toDate', {
        toDate: filters.toDate
      });
    }

    return query
      .orderBy('quotation.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string) {
    const quotation = await this.quotationRepo.findOne({
      where: { id },
      relations: ['customer', 'items', 'items.product'],
    });

    if (!quotation) {
      throw new NotFoundException('Quotation not found');
    }

    return quotation;
  }

  async update(id: string, dto: Partial<CreateQuotationDto>) {
    const quotation = await this.findOne(id);

    Object.assign(quotation, {
      title: dto.title ?? quotation.title,
      quotationDate: dto.quotationDate ?? quotation.quotationDate,
      validUntil: dto.validUntil ?? quotation.validUntil,
      notes: dto.notes ?? quotation.notes,
      terms: dto.terms ?? quotation.terms,
      taxRate: dto.taxRate ?? quotation.taxRate,
    });

    if (dto.items) {
      await this.itemRepo.delete({ quotationId: id });

      const items = dto.items.map((item, index) =>
        this.itemRepo.create({
          quotationId: id,
          productId: item.productId,
          lineNumber: index + 1,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount || 0,
          amount: this.calculateItemAmount(
            item.quantity,
            item.unitPrice,
            item.discount,
          ),
          memo: item.memo,
        }),
      );

      await this.itemRepo.save(items);

      const { subtotal, taxAmount, totalAmount } = this.calculateAmounts(
        dto.items,
        quotation.taxRate,
      );

      quotation.subtotal = subtotal;
      quotation.taxAmount = taxAmount;
      quotation.totalAmount = totalAmount;
    }

    await this.quotationRepo.save(quotation);

    this.logger.log(`Quotation updated: ${quotation.quotationNumber}`);

    return this.findOne(id);
  }

  async delete(id: string) {
    const quotation = await this.findOne(id);
    await this.quotationRepo.remove(quotation);
    this.logger.log(`Quotation deleted: ${quotation.quotationNumber}`);
  }

  async generatePDF(id: string): Promise<Buffer> {
    const quotation = await this.findOne(id);

    const pdfBuffer = await this.pdfGenerator.generate(quotation);

    quotation.pdfS3Key = `quotations/${quotation.quotationNumber}.pdf`;
    await this.quotationRepo.save(quotation);

    return pdfBuffer;
  }

  async sendByEmail(id: string, dto: SendEmailDto) {
    const quotation = await this.findOne(id);

    const pdfBuffer = await this.generatePDF(id);

    await this.emailService.sendQuotationEmail({
      to: dto.recipients,
      quotation,
      pdfAttachment: pdfBuffer,
    });

    if (quotation.status === 'draft') {
      quotation.status = 'sent';
      await this.quotationRepo.save(quotation);
    }

    this.logger.log(`Quotation sent: ${quotation.quotationNumber} to ${dto.recipients.join(', ')}`);

    return { success: true, recipients: dto.recipients };
  }

  async updateStatus(id: string, dto: UpdateStatusDto) {
    const quotation = await this.findOne(id);
    quotation.status = dto.status;
    await this.quotationRepo.save(quotation);

    this.logger.log(`Quotation status updated: ${quotation.quotationNumber} -> ${dto.status}`);

    return quotation;
  }

  private async generateQuotationNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const count = await this.quotationRepo.count({
      where: {
        quotationNumber: Like(`QT-${dateStr}-%`),
      },
    });

    return `QT-${dateStr}-${String(count + 1).padStart(3, '0')}`;
  }

  private getDefaultValidDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date;
  }

  private getDefaultTerms(): string {
    return `1. 납기: 주문 확정 후 7-14 영업일
2. 결제조건: NET 30일
3. 배송비: 별도
4. 견적 유효기간: 견적일로부터 30일
5. 상기 금액은 부가세 별도입니다.`;
  }

  private calculateAmounts(items: any[], taxRate: number) {
    const subtotal = items.reduce((sum, item) => {
      const itemAmount = this.calculateItemAmount(
        item.quantity,
        item.unitPrice,
        item.discount || 0,
      );
      return sum + itemAmount;
    }, 0);

    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }

  private calculateItemAmount(
    quantity: number,
    unitPrice: number,
    discount: number,
  ): number {
    const amount = quantity * unitPrice;
    const discountAmount = amount * (discount / 100);
    return amount - discountAmount;
  }
}
