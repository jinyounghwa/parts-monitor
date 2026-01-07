import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PriceHistory } from './price-history.entity';
import { Inventory } from '../../inventory/entities/inventory.entity';

export interface TargetSite {
  name: string;
  url: string;
  isActive: boolean;
}

export interface AlertThreshold {
  priceChangePercent: number;
  stockMin: number;
  emailRecipients?: string[];
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  partNumber: string;

  @Column({ nullable: true })
  partName: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  category: string;

  @Column({ type: 'text', nullable: true })
  specification: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  standardPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  purchasePrice: number;

  @Column({ default: 'EA' })
  unit: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  targetSites: TargetSite[];

  @Column({ type: 'jsonb', nullable: true })
  alertThreshold: AlertThreshold;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastScrapedAt: Date;

  @Column({ nullable: true })
  lastScrapedSite: string;

  @OneToMany(() => PriceHistory, (history) => history.product)
  priceHistories: PriceHistory[];

  @OneToMany(() => Inventory, (inventory) => inventory.product)
  inventories: Inventory[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
