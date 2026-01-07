import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { Product } from './product.entity';

@Entity('scraping_history')
@Index(['productId', 'scrapedAt'])
export class ScrapingHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  site: string;

  @Column({ type: 'text', nullable: true })
  url: string;

  @Column({ type: 'jsonb', nullable: true })
  scrapedData: any;

  @Column({ type: 'boolean', default: false })
  success: boolean;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'boolean', default: false })
  priceChanged: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  oldPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  newPrice: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  priceChangePercent: number;

  @Column({ type: 'boolean', default: false })
  stockChanged: boolean;

  @Column({ type: 'int', nullable: true })
  oldStock: number;

  @Column({ type: 'int', nullable: true })
  newStock: number;

  @Column({ type: 'int' })
  scrapeDuration: number; // in milliseconds

  @Column({ type: 'enum', enum: ['manual', 'scheduled'], default: 'manual' })
  triggerType: string;

  @Column({ nullable: true })
  triggeredBy: string;

  @CreateDateColumn()
  scrapedAt: Date;
}
