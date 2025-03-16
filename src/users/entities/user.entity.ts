import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';
import { ActivityLog } from 'src/activity-logs/entities/activity-log.entity';
import { UserProfile } from 'src/user-profiles/entities/user-profile.entity.js';
import { SubscriptionDetail } from 'src/subscription-details/entities/subscription-detail.entity';
import { UserPreference } from 'src/user-preferences/entities/user-preference.entity';
import { List } from 'src/lists/entities/list.entity';
import { Mood } from 'src/moods/entities/mood.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string; // This can be null if the user registers via social login

  @Column({ nullable: true })
  googleId: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @OneToOne(() => UserProfile, (profile) => profile.user, { cascade: true })
  @JoinColumn({ name: 'id' })
  profile: UserProfile;

  @OneToOne(() => SubscriptionDetail, (subscription) => subscription.user, {
    cascade: true,
  })
  @JoinColumn({ name: 'id' })
  subscriptionDetail: SubscriptionDetail;

  @OneToOne(() => UserPreference, (preference) => preference.user, {
    cascade: true,
  })
  @JoinColumn({ name: 'id' })
  preference: UserPreference;

  @ManyToMany(() => Role, (role) => role.users, { cascade: true })
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'roleId', referencedColumnName: 'id' },
  })
  roles: Role[];

  @OneToMany(() => ActivityLog, (activityLog) => activityLog.user)
  activityLogs: ActivityLog[];

  @OneToMany(() => List, (list) => list.user)
  lists: List[];

  @OneToMany(() => Mood, (mood) => mood.user)
  moods: Mood[];
}
