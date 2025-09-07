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

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  action: string;

  @Index()
  @Column('uuid', { nullable: true })
  userId?: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  meta?: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.activityLogs)
  @JoinColumn({ name: 'userId' })
  user: User;
}
