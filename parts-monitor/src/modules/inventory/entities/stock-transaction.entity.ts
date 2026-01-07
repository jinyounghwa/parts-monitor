import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';

@Entity('stock_transactions')
@Index(['productId', 'transactionDate'])
export class StockTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  warehouse: Warehouse;

  @Column({
    type: 'enum',
    enum: ['IN', 'OUT', 'ADJUST', 'RETURN']
  })
  type: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  beforeQuantity: number;

  @Column({ type: 'int' })
  afterQuantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  unitPrice: number;

  @Column({ nullable: true })
  reference: string;

  @Column({ type: 'text', nullable: true })
  memo: string;

  @Column({ nullable: true })
  performedBy: string;

  @CreateDateColumn()
  transactionDate: Date;
}
