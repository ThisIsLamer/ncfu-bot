import { User } from './user.entity.js';

export interface UserPresented {
  guid: string;
  firstName: string;
  lastName: string;
  institute: string;
  course: number;
  role: string;
  avatarUrl: string | null;
  theme: string;
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
      course: user.course,
      role: user.role,
      avatarUrl: user.avatarUrl,
      theme: user.theme,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static presentMany(users: User[]): UserPresented[] {
    return users.map(u => UserPresenter.present(u));
  }
}
