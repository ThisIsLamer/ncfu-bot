// --- Response types (from UserPresenter) ---

export interface UserResponse {
  guid: string
  firstName: string
  lastName: string
  institute: string
  group: string
  role: string
  avatarUrl: string | null
  theme: string
  notifications: boolean
  xamId: number | null
  createdAt: string
  updatedAt: string
}

export interface UserAdminResponse extends UserResponse {
  id: number
}

// --- Request DTOs ---

export interface CreateUserBody {
  firstName: string
  lastName: string
  group: string
  institute: string
  role?: string
  avatarUrl?: string
}

export interface UpdateUserBody {
  guid: string
  firstName?: string
  lastName?: string
  group?: string
  institute?: string
  role?: string
  avatarUrl?: string
}

export interface DeleteUserBody {
  guid: string
}
