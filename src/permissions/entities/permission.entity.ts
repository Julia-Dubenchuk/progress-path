import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from 'src/roles/entities/role.entity';

export enum Action {
  CREATE_LIST = 'create-list',
  EDIT_ITEM = 'edit-item',
  DELETE_USER = 'delete-user',
}

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: Action, unique: true })
  action: Action;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
