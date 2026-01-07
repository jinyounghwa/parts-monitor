import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { QuotationItem } from './quotation-item.entity';

@Entity('quotations')
export class Quotation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  quotationNumber: string;

  @Column()
  customerId: string;

  @ManyToOne(() => Customer)
  customer: Customer;

  @Column()
  title: string;

  @Column({ type: 'date' })
  quotationDate: Date;

  @Column({ type: 'date' })
  validUntil: Date;

  @Column({
    type: 'enum',
    enum: ['draft', 'sent', 'approved', 'rejected', 'expired'],
    default: 'draft'
  })
  status: string;

  @OneToMany(() => QuotationItem, (item) => item.quotation, { cascade: true })
  items: QuotationItem[];

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 10 })
  taxRate: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  terms: string;

  @Column({ nullable: true })
  pdfS3Key: string;

  @Column({ nullable: true })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
