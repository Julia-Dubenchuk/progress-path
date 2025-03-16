import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

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

  @Column({ nullable: true, comment: 'male, female, other' })
  gender: string;

  @Column({ nullable: true })
  location: string;

  @OneToOne(() => User, (user) => user.profile)
  @JoinColumn({ name: 'id' })
  user: User;
}
