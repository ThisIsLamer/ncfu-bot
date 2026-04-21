import type {
  CreateUserBody,
  DeleteUserBody,
  UpdateUserBody,
  UserAdminResponse,
  UserResponse,
} from './types'
import apiClient, { type ApiResponse } from './client'

export const usersApi = {
  getAccount (): Promise<ApiResponse<UserResponse>> {
    return apiClient.get('/users/account')
  },

  register (body: { guid: string }): Promise<ApiResponse<UserResponse>> {
    return apiClient.post('/users/register', body)
  },

  getStats (): Promise<ApiResponse<{ attended: number }>> {
    return apiClient.get('/users/stats')
  },

  updateNotifications (enabled: boolean): Promise<ApiResponse<{ notifications: boolean }>> {
    return apiClient.post('/users/notifications', { enabled })
  },

  create (body: CreateUserBody): Promise<ApiResponse<UserAdminResponse>> {
    return apiClient.post('/users/create', body)
  },

  update (body: UpdateUserBody): Promise<ApiResponse<UserAdminResponse>> {
    return apiClient.post('/users/update', body)
  },

  remove (body: DeleteUserBody): Promise<ApiResponse<void>> {
    return apiClient.delete('/users', { data: body })
  },
}
