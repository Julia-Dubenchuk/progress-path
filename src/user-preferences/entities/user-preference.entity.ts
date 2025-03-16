import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity('user_preferences')
export class UserPreference {
  @PrimaryColumn('uuid')
  id: string; // Shared with users.id

  @Column({ default: 'light' })
  theme: string;

  @Column({ nullable: true })
  notificationSettings: string;

  @Column({ nullable: true })
  language: string;

  @OneToOne(() => User, (user) => user.preference)
  @JoinColumn({ name: 'id' })
  user: User;
}
