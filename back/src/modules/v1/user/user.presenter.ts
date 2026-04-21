import { User } from './user.entity.js';

export interface UserPresented {
  guid: string;
  firstName: string;
  lastName: string;
  institute: string;
  group: string;
  role: string;
  avatarUrl: string | null;
  theme: string;
  notifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPresentedAdmin extends UserPresented {
  id: number;
}

export class UserPresenter {
  static present(user: User): UserPresented {
    return {
      guid: user.guid,
      firstName: user.firstName,
      lastName: user.lastName,
      institute: user.institute.guid,
      group: user.group,
      role: user.role,
      avatarUrl: user.avatarUrl,
      theme: user.theme,
      notifications: user.notifications,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static presentAdmin(user: User): UserPresentedAdmin {
    return {
      id: user.id,
      ...UserPresenter.present(user),
    };
  }

  static presentMany(users: User[]): UserPresented[] {
    return users.map(u => UserPresenter.present(u));
  }

  static presentManyAdmin(users: User[]): UserPresentedAdmin[] {
    return users.map(u => UserPresenter.presentAdmin(u));
  }
}
