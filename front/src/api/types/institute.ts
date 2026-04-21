// --- Response types (from InstitutePresenter) ---

export interface InstituteResponse {
  guid: string
  name: string
  createdAt: string
  updatedAt: string
}

// --- Request DTOs ---

export interface CreateInstituteBody {
  name: string
}

export interface UpdateInstituteBody {
  guid: string
  name?: string
}

export interface DeleteInstituteBody {
  guid: string
}

// --- Paginated users response ---

export interface GetInstituteUsersParams {
  guid: string
  limit?: number
  offset?: number
}

export interface InstituteUsersResponse {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  users: import('./user').UserResponse[]
  total: number
  limit: number
  offset: number
}
