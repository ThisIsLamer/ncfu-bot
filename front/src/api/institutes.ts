import type {
  CreateInstituteBody,
  DeleteInstituteBody,
  GetInstituteUsersParams,
  InstituteResponse,
  InstituteUsersResponse,
  UpdateInstituteBody,
} from './types'
import apiClient, { type ApiResponse } from './client'

export const institutesApi = {
  getAll (): Promise<ApiResponse<InstituteResponse[]>> {
    return apiClient.get('/institutes')
  },

  getUsers (params: GetInstituteUsersParams): Promise<ApiResponse<InstituteUsersResponse>> {
    return apiClient.get('/institutes/users', { params })
  },

  create (body: CreateInstituteBody): Promise<ApiResponse<InstituteResponse>> {
    return apiClient.post('/institutes/create', body)
  },

  update (body: UpdateInstituteBody): Promise<ApiResponse<InstituteResponse>> {
    return apiClient.post('/institutes/update', body)
  },

  remove (body: DeleteInstituteBody): Promise<ApiResponse<void>> {
    return apiClient.delete('/institutes', { data: body })
  },
}
