import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Item, STATUS } from 'src/items/entities/item.entity';

@Entity('lists')
export class List {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('uuid')
  categoryId: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'date', nullable: true })
  targetDate: Date;

  @Column({ type: 'enum', enum: STATUS })
  status: STATUS;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.lists)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Category, (category) => category.lists)
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => Item, (item) => item.list)
  items: Item[];
}
