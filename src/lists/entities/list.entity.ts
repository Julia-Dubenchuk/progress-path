import { ApiProperty } from '@nestjs/swagger';
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
import { STATUS } from '../../common/enums/status.enum';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';
import { Item } from '../../items/entities/item.entity';

@Entity('lists')
export class List {
  @ApiProperty({
    description: 'List id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ApiProperty({
    description: 'List title',
    example: 'Weekly goals',
  })
  @Column()
  title!: string;

  @ApiProperty({
    description: 'Optional description',
    example: 'Track the top priorities for this week.',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @ApiProperty({
    description: 'Category id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column('uuid')
  categoryId!: string;

  @ApiProperty({
    description: 'User id',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Column('uuid')
  userId!: string;

  @ApiProperty({
    description: 'Target completion date',
    example: '2026-03-01',
    nullable: true,
  })
  @Column({ type: 'date', nullable: true })
  targetDate!: Date | null;

  @ApiProperty({ enum: STATUS })
  @Column({ type: 'enum', enum: STATUS })
  status!: STATUS;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-03-01T12:00:00.000Z',
  })
  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-03-01T12:00:00.000Z',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.lists)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ApiProperty({ type: () => Category })
  @ManyToOne(() => Category, (category) => category.lists)
  @JoinColumn({ name: 'categoryId' })
  category!: Category;

  @ApiProperty({ type: () => [Item] })
  @OneToMany(() => Item, (item) => item.list)
  items!: Item[];
}
