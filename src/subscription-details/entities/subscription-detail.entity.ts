import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

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
  id: string; // Shared with users.id

  @Column({ type: 'enum', enum: SubscriptionType })
  type: SubscriptionType;

  @Column({ type: 'date', nullable: true })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'enum', enum: PaymentStatus, nullable: true })
  paymentStatus: PaymentStatus;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.subscriptionDetail)
  @JoinColumn({ name: 'id' })
  user: User;
}
