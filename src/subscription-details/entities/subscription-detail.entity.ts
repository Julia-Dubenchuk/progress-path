import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum SubscriptionType {
  PREMIUM = 'premium',
  FREE = 'free',
}

export enum PaymentStatus {
  PAID = 'paid',
  PENDING = 'pending',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

@Entity('subscription_details')
export class SubscriptionDetail {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: SubscriptionType })
  type: SubscriptionType;

  @Column({ type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ type: 'enum', enum: PaymentStatus, nullable: true })
  paymentStatus: PaymentStatus | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.subscriptionDetail)
  user: User;
}
