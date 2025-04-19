import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../../roles/entities/role.entity';

export enum Action {
  // User management permissions
  CREATE_USER = 'create_user',
  READ_USER = 'read_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',

  // Role management permissions
  MANAGE_ROLES = 'manage_roles',

  // Content management permissions
  CREATE_CONTENT = 'create_content',
  READ_CONTENT = 'read_content',
  UPDATE_CONTENT = 'update_content',
  DELETE_CONTENT = 'delete_content',
  APPROVE_CONTENT = 'approve_content',

  // Comments and moderation
  MANAGE_COMMENTS = 'manage_comments',

  // Data export and analytics
  EXPORT_DATA = 'export_data',
  VIEW_ANALYTICS = 'view_analytics',

  // System settings and configurations
  MANAGE_SETTINGS = 'manage_settings',
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
