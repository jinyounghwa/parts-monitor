import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');
import { Quotation } from './entities/quotation.entity';

@Injectable()
export class PDFGeneratorService {
  async generate(quotation: Quotation): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        bufferPages: true,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc
        .fontSize(24)
        .text('견 적 서', { align: 'center' })
        .moveDown(2);

      const startY = doc.y;
      doc
        .fontSize(10)
        .text(`견적번호: ${quotation.quotationNumber}`, 350, startY)
        .text(`작성일: ${this.formatDate(quotation.quotationDate)}`, 350)
        .text(`유효기한: ${this.formatDate(quotation.validUntil)}`, 350)
        .moveDown(2);

      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text('고객 정보')
        .font('Helvetica')
        .fontSize(10)
        .text(`회사명: ${quotation.customer.name}`)
        .text(`사업자번호: ${quotation.customer.businessNumber || '-'}`)
        .text(`담당자: ${quotation.customer.contactPerson || '-'}`)
        .text(`연락처: ${quotation.customer.phone || '-'}`)
        .text(`이메일: ${quotation.customer.email || '-'}`)
        .moveDown(2);

      if (quotation.title) {
        doc
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(`제목: ${quotation.title}`)
          .font('Helvetica')
          .moveDown();
      }

      const tableTop = doc.y;
      const colWidths = [40, 180, 60, 70, 60, 90];
      const headers = ['No', '품명/규격', '수량', '단가', '할인', '금액'];

      let x = 50;
      doc.fontSize(9).font('Helvetica-Bold');
      headers.forEach((header, i) => {
        doc.text(header, x, tableTop, {
          width: colWidths[i],
          align: 'center'
        });
        x += colWidths[i];
      });

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      doc.font('Helvetica').fontSize(8);
      let y = tableTop + 20;

      quotation.items.forEach((item, index) => {
        if (y > 700) {
          doc.addPage();
          y = 50;
        }

        x = 50;
        const values = [
          item.lineNumber.toString(),
          `${item.product.partName}\n${item.product.partNumber}\n${item.product.specification || ''}`,
          `${item.quantity} ${item.product.unit}`,
          this.formatCurrency(item.unitPrice),
          item.discount > 0 ? `${item.discount}%` : '-',
          this.formatCurrency(item.amount),
        ];

        const cellHeight = 35;

        values.forEach((value, i) => {
          const align = i === 1 ? 'left' : 'center';
          doc.text(String(value), x + 2, y + 2, {
            width: colWidths[i] - 4,
            align,
            ellipsis: true,
          });
          x += colWidths[i];
        });

        y += cellHeight;
        doc
          .moveTo(50, y)
          .lineTo(550, y)
          .stroke();
      });

      y += 15;
      const summaryX = 350;

      doc
        .fontSize(10)
        .text(`소계:`, summaryX, y, { width: 80, align: 'left' })
        .text(this.formatCurrency(quotation.subtotal), summaryX + 80, y, {
          width: 120,
          align: 'right'
        });

      y += 20;
      doc
        .text(`부가세(${quotation.taxRate}%):`, summaryX, y, { width: 80, align: 'left' })
        .text(this.formatCurrency(quotation.taxAmount), summaryX + 80, y, {
          width: 120,
          align: 'right'
        });

      y += 25;
      doc
        .fontSize(12)
        .font('Helvetica-Bold')
        .text(`합계:`, summaryX, y, { width: 80, align: 'left' })
        .text(this.formatCurrency(quotation.totalAmount), summaryX + 80, y, {
          width: 120,
          align: 'right'
        });

      if (quotation.notes) {
        doc
          .font('Helvetica')
          .moveDown(3)
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('비고:')
          .font('Helvetica')
          .fontSize(9)
          .text(quotation.notes, { width: 500 });
      }

      if (quotation.terms) {
        doc
          .moveDown(2)
          .fontSize(10)
          .font('Helvetica-Bold')
          .text('거래 조건:')
          .font('Helvetica')
          .fontSize(8)
          .text(quotation.terms, { width: 500 });
      }

      doc
        .fontSize(8)
        .fillColor('#666666')
        .text(
          `이 견적서는 ${this.formatDate(new Date())}에 생성되었습니다.`,
          50,
          doc.page.height - 50,
          { align: 'center' }
        );

      doc.end();
    });
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
    }).format(amount);
  }
}
