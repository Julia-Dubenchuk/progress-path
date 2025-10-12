import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ActivitySource {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
  API = 'API',
  SYSTEM = 'SYSTEM',
}

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  action: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'boolean', nullable: true })
  success?: boolean;

  @Index()
  @Column('uuid', { nullable: true })
  userId?: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip?: string | null;

  @Column({ type: 'enum', enum: ActivitySource, nullable: true })
  source?: ActivitySource;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.activityLogs)
  @JoinColumn({ name: 'userId' })
  user: User;
}
