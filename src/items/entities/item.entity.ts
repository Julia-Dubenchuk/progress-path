import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { List } from 'src/lists/entities/list.entity';

@Entity('items')
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ comment: 'planned, in progress, completed' })
  status: string;

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
