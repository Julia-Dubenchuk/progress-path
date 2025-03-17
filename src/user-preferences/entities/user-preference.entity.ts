import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

@Entity('user_preferences')
export class UserPreference {
  @PrimaryColumn('uuid')
  id: string; // Shared with users.id

  @Column({ type: 'enum', enum: Theme, default: Theme.LIGHT })
  theme: string;

  @Column({ nullable: true })
  notificationSettings: string;

  @Column({ nullable: true })
  language: string;

  @OneToOne(() => User, (user) => user.preference)
  @JoinColumn({ name: 'id' })
  user: User;
}
