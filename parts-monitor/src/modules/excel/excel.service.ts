import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../product/entities/product.entity';
import { Inventory } from '../inventory/entities/inventory.entity';

@Injectable()
export class ExcelService {
  private readonly logger = new Logger(ExcelService.name);

  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
    @InjectRepository(Inventory)
    private inventoryRepo: Repository<Inventory>,
  ) {}

  async importProducts(buffer: Buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const worksheet = workbook.getWorksheet(1);
    const products = [];
    const errors = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      try {
        const [
          partNumber,
          partName,
          manufacturer,
          category,
          specification,
          standardPrice,
          purchasePrice,
          unit,
        ] = (row.values as any[]).slice(1);

        if (!partNumber || !partName) {
          errors.push(`Row ${rowNumber}: 부품번호와 부품명은 필수입니다.`);
          return;
        }

        products.push({
          partNumber: String(partNumber).trim(),
          partName: String(partName).trim(),
          manufacturer: manufacturer ? String(manufacturer).trim() : '',
          category: category ? String(category).trim() : null,
          specification: specification ? String(specification).trim() : null,
          standardPrice: Number(standardPrice) || 0,
          purchasePrice: purchasePrice ? Number(purchasePrice) : null,
          unit: unit ? String(unit).trim() : 'EA',
        });
      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error.message}`);
      }
    });

    const savedProducts = [];
    for (const product of products) {
      try {
        const saved = await this.productRepo.save(product);
        savedProducts.push(saved);
      } catch (error) {
        errors.push(`${product.partNumber}: ${error.message}`);
      }
    }

    this.logger.log(`Products imported: ${savedProducts.length} success, ${errors.length} failed`);

    return {
      imported: savedProducts.length,
      failed: errors.length,
      products: savedProducts,
      errors,
    };
  }

  async exportInventory(): Promise<Buffer> {
    const inventories = await this.inventoryRepo.find({
      relations: ['product', 'warehouse'],
      order: { product: { partNumber: 'ASC' } },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('재고현황');

    worksheet.columns = [
      { header: '부품번호', key: 'partNumber', width: 15 },
      { header: '부품명', key: 'partName', width: 30 },
      { header: '제조사', key: 'manufacturer', width: 15 },
      { header: '규격', key: 'specification', width: 25 },
      { header: '창고', key: 'warehouse', width: 15 },
      { header: '현재고', key: 'quantity', width: 10 },
      { header: '안전재고', key: 'safetyStock', width: 10 },
      { header: '발주점', key: 'reorderPoint', width: 10 },
      { header: '상태', key: 'status', width: 12 },
      { header: '위치', key: 'location', width: 15 },
      { header: '최종갱신', key: 'lastUpdated', width: 18 },
    ];

    worksheet.getRow(1).font = { bold: true, size: 11 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    worksheet.getRow(1).font = { ...worksheet.getRow(1).font, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;

    inventories.forEach((inv) => {
      const row = worksheet.addRow({
        partNumber: inv.product.partNumber,
        partName: inv.product.partName,
        manufacturer: inv.product.manufacturer,
        specification: inv.product.specification || '-',
        warehouse: inv.warehouse?.name || '본사',
        quantity: inv.quantity,
        safetyStock: inv.safetyStock,
        reorderPoint: inv.reorderPoint,
        status: this.getStatusText(inv.status),
        location: inv.location || '-',
        lastUpdated: this.formatDate(inv.lastUpdated),
      });

      const statusColors = {
        out_of_stock: 'FFFF0000',
        critical: 'FFFF6B6B',
        low: 'FFFFEB3B',
        sufficient: 'FF4CAF50',
      };

      const statusColor = statusColors[inv.status] || 'FFFFFFFF';

      row.getCell('status').fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: statusColor },
      };

      row.getCell('status').font = {
        bold: true,
        color: { argb: inv.status === 'sufficient' ? 'FFFFFFFF' : 'FF000000' },
      };

      row.alignment = { vertical: 'middle' };
      row.height = 20;
    });

    worksheet.autoFilter = {
      from: 'A1',
      to: `K${inventories.length + 1}`,
    };

    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    this.logger.log(`Inventory exported: ${inventories.length} items`);

    return Buffer.from(buffer);
  }

  async exportProducts(): Promise<Buffer> {
    const products = await this.productRepo.find({
      where: { isActive: true },
      order: { partNumber: 'ASC' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('부품목록');

    worksheet.columns = [
      { header: '부품번호', key: 'partNumber', width: 15 },
      { header: '부품명', key: 'partName', width: 30 },
      { header: '제조사', key: 'manufacturer', width: 15 },
      { header: '카테고리', key: 'category', width: 15 },
      { header: '규격', key: 'specification', width: 25 },
      { header: '판매단가', key: 'standardPrice', width: 12 },
      { header: '구매단가', key: 'purchasePrice', width: 12 },
      { header: '단위', key: 'unit', width: 8 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD9E1F2' },
    };

    products.forEach((product) => {
      worksheet.addRow({
        partNumber: product.partNumber,
        partName: product.partName,
        manufacturer: product.manufacturer,
        category: product.category || '-',
        specification: product.specification || '-',
        standardPrice: product.standardPrice,
        purchasePrice: product.purchasePrice || '-',
        unit: product.unit,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private getStatusText(status: string): string {
    const statusMap = {
      out_of_stock: '재고없음',
      critical: '긴급',
      low: '부족',
      sufficient: '충분',
    };
    return statusMap[status] || status;
  }

  private formatDate(date: Date): string {
    return new Date(date).toLocaleString('ko-KR');
  }
}
