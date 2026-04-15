import { Institute } from './institute.entity.js';

export interface InstitutePresented {
  guid: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InstitutePresentedAdmin extends InstitutePresented {
  id: number;
}

export class InstitutePresenter {
  static present(institute: Institute): InstitutePresented {
    return {
      guid: institute.guid,
      name: institute.name,
      createdAt: institute.createdAt,
      updatedAt: institute.updatedAt,
    };
  }

  static presentMany(institutes: Institute[]): InstitutePresented[] {
    return institutes.map(i => InstitutePresenter.present(i));
  }
}
