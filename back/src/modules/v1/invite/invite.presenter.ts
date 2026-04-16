import { Invite } from './invite.entity.js';

export interface InvitePresented {
  guid: string;
  telegramId: string;
  firstName: string;
  lastName: string;
  institute: string;
  course: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvitePresentedAdmin extends InvitePresented {
  id: number;
}

export class InvitePresenter {
  static present(invite: Invite): InvitePresented {
    return {
      guid: invite.guid,
      telegramId: invite.telegramId,
      firstName: invite.firstName,
      lastName: invite.lastName,
      institute: invite.institute.guid,
      course: invite.course,
      status: invite.status,
      createdAt: invite.createdAt,
      updatedAt: invite.updatedAt,
    };
  }

  static presentAdmin(invite: Invite): InvitePresentedAdmin {
    return {
      id: invite.id,
      ...InvitePresenter.present(invite),
    };
  }

  static presentMany(invites: Invite[]): InvitePresented[] {
    return invites.map(i => InvitePresenter.present(i));
  }

  static presentManyAdmin(invites: Invite[]): InvitePresentedAdmin[] {
    return invites.map(i => InvitePresenter.presentAdmin(i));
  }
}
