import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('monitoring_jobs')
export class MonitoringJob {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'simple-array' })
  productIds: string[];

  @Column()
  schedule: string;

  @Column({ type: 'simple-array' })
  emailRecipients: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastRunAt: Date;

  @Column({ nullable: true })
  nextRunAt: Date;

  @Column({ type: 'int', default: 0 })
  successCount: number;

  @Column({ type: 'int', default: 0 })
  failureCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
