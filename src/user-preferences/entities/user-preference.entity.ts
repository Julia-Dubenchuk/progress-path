import { Entity, PrimaryColumn, Column, OneToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
}

@Entity('user_preferences')
export class UserPreference {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: Theme, default: Theme.LIGHT })
  theme: string;

  @Column({ nullable: true })
  notificationSettings: string;

  @Column({ nullable: true })
  language: string;

  @OneToOne(() => User, (user) => user.preference)
  user: User;
}
