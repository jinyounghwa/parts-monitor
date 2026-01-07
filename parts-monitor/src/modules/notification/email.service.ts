import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import { SESService } from './ses.service';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private templates: Map<string, Handlebars.TemplateDelegate> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly sesService: SESService,
  ) {}

  async onModuleInit() {
    await this.loadTemplates();
  }

  private async loadTemplates() {
    const templateDir = path.join(__dirname, 'templates');
    const templates = ['daily-report', 'price-alert', 'stock-alert', 'quotation'];

    for (const templateName of templates) {
      try {
        const templatePath = path.join(templateDir, `${templateName}.hbs`);
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        this.templates.set(templateName, Handlebars.compile(templateContent));
      } catch (error) {
        this.logger.error(`Failed to load template: ${templateName}`, error.stack);
      }
    }

    this.registerHelpers();
  }

  private registerHelpers() {
    Handlebars.registerHelper('formatDate', (date: Date) => {
      return new Date(date).toLocaleDateString('ko-KR');
    });

    Handlebars.registerHelper('formatNumber', (num: number) => {
      return new Intl.NumberFormat('ko-KR').format(num);
    });

    Handlebars.registerHelper('formatPercent', (num: number) => {
      return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
    });

    Handlebars.registerHelper('formatCurrency', (num: number) => {
      return new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: 'KRW',
      }).format(num);
    });

    Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
    Handlebars.registerHelper('lt', (a: number, b: number) => a < b);
    Handlebars.registerHelper('eq', (a: any, b: any) => a === b);
  }

  async sendDailyReport(recipients: string[], reportData: any) {
    try {
      const template = this.templates.get('daily-report');
      if (!template) {
        throw new Error('daily-report template not found');
      }

      const html = template({
        date: new Date(),
        products: reportData.products,
        summary: reportData.summary,
      });

      await this.sesService.sendEmail({
        to: recipients,
        subject: `[전자부품 모니터링] ${new Date().toLocaleDateString('ko-KR')} 일일 리포트`,
        html,
      });

      this.logger.log(`Daily report sent to ${recipients.length} recipients`);
    } catch (error) {
      this.logger.error('Failed to send daily report', error.stack);
      throw error;
    }
  }

  async sendPriceAlert(recipients: string[], alertData: any) {
    try {
      const template = this.templates.get('price-alert');
      if (!template) {
        throw new Error('price-alert template not found');
      }

      const html = template(alertData);

      const subject = alertData.changes.priceChange > 0
        ? `[가격상승 알림] ${alertData.product.partNumber}`
        : `[가격하락 알림] ${alertData.product.partNumber}`;

      await this.sesService.sendEmail({
        to: recipients,
        subject,
        html,
      });

      this.logger.log(`Price alert sent to ${recipients.length} recipients`);
    } catch (error) {
      this.logger.error('Failed to send price alert', error.stack);
      throw error;
    }
  }

  async sendStockAlert(recipients: string[], alertData: any) {
    try {
      const template = this.templates.get('stock-alert');
      if (!template) {
        throw new Error('stock-alert template not found');
      }

      const html = template(alertData);

      const statusText = {
        in_stock: '재고충분',
        low_stock: '재고부족',
        out_of_stock: '품절',
        unknown: '알수없음',
      };

      const htmlWithContext = template({
        ...alertData,
        stockStatusText: statusText[alertData.stockStatus] || '알수없음',
      });

      await this.sesService.sendEmail({
        to: recipients,
        subject: `[재고 알림] ${alertData.product.partNumber}`,
        html: htmlWithContext,
      });

      this.logger.log(`Stock alert sent to ${recipients.length} recipients`);
    } catch (error) {
      this.logger.error('Failed to send stock alert', error.stack);
      throw error;
    }
  }

  async sendQuotationEmail(params: {
    to: string[];
    quotation: any;
    pdfAttachment: Buffer;
  }) {
    try {
      const template = this.templates.get('quotation');
      if (!template) {
        throw new Error('quotation template not found');
      }

      const html = template({
        quotation: params.quotation,
        customer: params.quotation.customer,
      });

      await this.sesService.sendEmail({
        to: params.to,
        subject: `[견적서] ${params.quotation.title} - ${params.quotation.customer.name}`,
        html,
        attachments: [
          {
            filename: `${params.quotation.quotationNumber}.pdf`,
            content: params.pdfAttachment,
            contentType: 'application/pdf',
          },
        ],
      });

      this.logger.log(`Quotation email sent: ${params.quotation.quotationNumber}`);
    } catch (error) {
      this.logger.error('Failed to send quotation email', error.stack);
      throw error;
    }
  }

  async sendLowStockAlert(params: {
    to: string[];
    inventories: any[];
  }) {
    const html = `
      <h2>재고 부족 알림</h2>
      <p>다음 부품의 재고가 부족합니다:</p>
      <table border="1" cellpadding="5" cellspacing="0">
        <thead>
          <tr>
            <th>부품번호</th>
            <th>부품명</th>
            <th>현재고</th>
            <th>안전재고</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          ${params.inventories.map(inv => `
            <tr>
              <td>${inv.product.partNumber}</td>
              <td>${inv.product.partName}</td>
              <td>${inv.quantity}</td>
              <td>${inv.safetyStock}</td>
              <td style="color: ${inv.status === 'out_of_stock' ? 'red' : 'orange'}">
                ${inv.status === 'out_of_stock' ? '재고없음' : '부족'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    await this.sesService.sendEmail({
      to: params.to,
      subject: '[재고 알림] 재고 부족 부품 확인 필요',
      html,
    });

    this.logger.log(`Low stock alert sent to ${params.to.length} recipients`);
  }

}
