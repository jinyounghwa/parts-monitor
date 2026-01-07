import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { Quotation } from '../quotation/entities/quotation.entity';

@Injectable()
export class CustomerHistoryService {
  private readonly logger = new Logger(CustomerHistoryService.name);

  constructor(
    @InjectRepository(Customer)
    private readonly customerRepo: Repository<Customer>,
    @InjectRepository(Quotation)
    private readonly quotationRepo: Repository<Quotation>,
  ) {}

  async getQuotationHistory(
    customerId: string,
    limit: number = 20,
    offset: number = 0,
  ) {
    const [quotations, total] = await this.quotationRepo.findAndCount({
      where: { customerId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      customerId,
      quotations,
      total,
      hasMore: offset + limit < total,
    };
  }

  async getCustomerStats(customerId: string) {
    const quotations = await this.quotationRepo.find({
      where: { customerId },
    });

    const totalQuotations = quotations.length;
    const approvedQuotations = quotations.filter((q) => q.status === 'approved')
      .length;
    const rejectedQuotations = quotations.filter((q) => q.status === 'rejected')
      .length;

    const totalAmount = quotations.reduce((sum, q) => sum + q.totalAmount, 0);
    const approvedAmount = quotations
      .filter((q) => q.status === 'approved')
      .reduce((sum, q) => sum + q.totalAmount, 0);

    // Get most recent quotation
    const mostRecent = quotations
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 1)[0];

    // Get quotations in the last year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const yearlyQuotations = quotations.filter(
      (q) => q.createdAt >= oneYearAgo,
    );
    const yearlyAmount = yearlyQuotations.reduce(
      (sum, q) => sum + q.totalAmount,
      0,
    );

    return {
      customerId,
      totalQuotations,
      approvedQuotations,
      rejectedQuotations,
      approvalRate:
        totalQuotations > 0
          ? (approvedQuotations / totalQuotations) * 100
          : 0,
      totalAmount,
      approvedAmount,
      yearlyQuotations: yearlyQuotations.length,
      yearlyAmount,
      averageQuotationValue:
        totalQuotations > 0 ? totalAmount / totalQuotations : 0,
      mostRecentQuotation: mostRecent || null,
    };
  }

  async getRecentActivity(customerId: string, limit: number = 10) {
    const quotations = await this.quotationRepo.find({
      where: { customerId },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return quotations.map((q) => ({
      type: 'quotation',
      id: q.id,
      quotationNumber: q.quotationNumber,
      title: q.title,
      status: q.status,
      totalAmount: q.totalAmount,
      itemCount: q.items.length,
      createdAt: q.createdAt,
    }));
  }

  async getTopProducts(customerId: string, limit: number = 10) {
    const quotations = await this.quotationRepo.find({
      where: { customerId },
      relations: ['items', 'items.product'],
    });

    // Aggregate product quantities
    const productQuantities = new Map<string, { quantity: number; amount: number }>();

    for (const quotation of quotations) {
      if (quotation.status !== 'approved') continue; // Only count approved quotations

      for (const item of quotation.items) {
        const existing = productQuantities.get(item.productId);
        if (existing) {
          existing.quantity += item.quantity;
          existing.amount += item.amount;
        } else {
          productQuantities.set(item.productId, {
            quantity: item.quantity,
            amount: item.amount,
          });
        }
      }
    }

    // Sort by total amount
    const sorted = Array.from(productQuantities.entries())
      .map(([productId, data]) => ({
        productId,
        ...data,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);

    // Get full product details
    const productIds = sorted.map((s) => s.productId);
    // You would need to fetch products with these IDs
    // For now, just return the sorted data

    return sorted;
  }

  async getCustomerTimeline(customerId: string, limit: number = 20) {
    const quotations = await this.quotationRepo.find({
      where: { customerId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
      take: limit,
    });

    return quotations.map((q) => ({
      date: q.createdAt,
      event: 'quotation_created',
      quotationNumber: q.quotationNumber,
      title: q.title,
      status: q.status,
      amount: q.totalAmount,
    }));
  }
}
