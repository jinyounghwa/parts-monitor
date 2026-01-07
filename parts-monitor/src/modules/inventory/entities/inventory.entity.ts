import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, UpdateDateColumn, Index } from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';

@Entity('inventories')
@Index(['productId', 'warehouseId'], { unique: true })
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  productId: string;

  @ManyToOne(() => Product, (product) => product.inventories)
  product: Product;

  @Column({ nullable: true })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  warehouse: Warehouse;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'int', default: 0 })
  safetyStock: number;

  @Column({ type: 'int', default: 0 })
  reorderPoint: number;

  @Column({ nullable: true })
  location: string;

  @Column({
    type: 'enum',
    enum: ['sufficient', 'low', 'critical', 'out_of_stock'],
    default: 'sufficient'
  })
  status: string;

  @UpdateDateColumn()
  lastUpdated: Date;
}
