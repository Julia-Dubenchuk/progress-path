import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity('moods')
export class Mood {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ comment: 'happy, sad, anxiety' })
  mood: string;

  @Column({ type: 'text', nullable: true, comment: 'Reasons' })
  note: string;

  @Column({ type: 'date' })
  date: Date;

  @Column('uuid')
  userId: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.moods)
  @JoinColumn({ name: 'userId' })
  user: User;
}
