import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { List } from '../../lists/entities/list.entity';

export enum CategoryTitle {
  MOVIES = 'movies',
  BOOKS = 'books',
  ARTICLES = 'articles',
  GOALS = 'goals',
  SKILLS = 'skills',
  WORK = 'work',
  PERSONAL = 'personal',
  LEARNING = 'learning',
}

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: CategoryTitle, unique: true })
  title: CategoryTitle;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => List, (list) => list.category)
  lists: List[];
}
