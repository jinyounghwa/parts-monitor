import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Quotation } from './quotation.entity';
import { Product } from '../../product/entities/product.entity';

@Entity('quotation_items')
export class QuotationItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quotationId: string;

  @ManyToOne(() => Quotation, (quotation) => quotation.items)
  quotation: Quotation;

  @Column()
  productId: string;

  @ManyToOne(() => Product)
  product: Product;

  @Column({ type: 'int', default: 1 })
  lineNumber: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  discount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'text', nullable: true })
  memo: string;
}
