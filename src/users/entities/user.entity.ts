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
import { Role } from '../../roles/entities/role.entity';
import { ActivityLog } from '../../activity-logs/entities/activity-log.entity';
import { UserProfile } from '../../user-profiles/entities/user-profile.entity';
import { SubscriptionDetail } from '../../subscription-details/entities/subscription-detail.entity';
import { UserPreference } from '../../user-preferences/entities/user-preference.entity';
import { List } from '../../lists/entities/list.entity';
import { Mood } from '../../moods/entities/mood.entity';

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
  @JoinColumn({ name: 'id', foreignKeyConstraintName: 'FK_user_profile' })
  profile: UserProfile;

  @OneToOne(() => SubscriptionDetail, (subscription) => subscription.user, {
    cascade: true,
  })
  @JoinColumn({ name: 'id', foreignKeyConstraintName: 'FK_user_subscription' })
  subscriptionDetail: SubscriptionDetail;

  @OneToOne(() => UserPreference, (preference) => preference.user, {
    cascade: true,
  })
  @JoinColumn({ name: 'id', foreignKeyConstraintName: 'FK_user_preference' })
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
