import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('user_profiles')
export class UserProfile {
  @PrimaryColumn('uuid')
  id: string; // This will be the same as the user's id

  @Column({
    type: 'text',
    nullable: true,
    comment: 'A brief personal description or summary about the user',
  })
  bio: string;

  // For binary data, type is Buffer (or string if store a URL)
  @Column({ type: 'bytea', nullable: true })
  profilePicture: Buffer;

  @Column({ type: 'date', nullable: true })
  birthday: Date;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: true,
  })
  gender: Gender;

  @Column({ nullable: true })
  location: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'id' })
  user: User;
}
