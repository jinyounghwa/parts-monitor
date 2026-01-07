import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Product } from './product.entity';

export interface ScrapedPrice {
  quantity: number;
  unitPrice: number;
  currency: string;
}

export enum StockStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  UNKNOWN = 'unknown',
}

@Entity('price_histories')
@Index(['productId', 'scrapedAt'])
@Index(['productId', 'site'])
export class PriceHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.priceHistories)
  product: Product;

  @Column()
  site: string;

  @Column()
  url: string;

  @CreateDateColumn()
  scrapedAt: Date;

  @Column({ type: 'jsonb' })
  prices: ScrapedPrice[];

  @Column({ type: 'int', nullable: true })
  stockQuantity: number;

  @Column({
    type: 'enum',
    enum: StockStatus,
    default: StockStatus.UNKNOWN,
  })
  stockStatus: StockStatus;

  @Column({ nullable: true })
  leadTime: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  priceChange: number;

  @Column({ type: 'int', nullable: true })
  stockChange: number;

  @Column({ type: 'text', nullable: true })
  screenshotS3Key: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}
