import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { List } from '../../lists/entities/list.entity';

export enum STATUS {
  PLANNED = 'planned',
  IN_PROGRESS = 'in progress',
  COMPLETED = 'completed',
}

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: STATUS })
  status: STATUS;

  @Column({ type: 'int' })
  priority: number;

  @Column('uuid')
  listId: string;

  @Column({ type: 'date', nullable: true })
  targetDate: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => List, (list) => list.items)
  @JoinColumn({ name: 'listId' })
  list: List;
}
