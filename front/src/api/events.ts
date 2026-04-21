import type {
  CreateEventBody,
  DeleteEventBody,
  EventResponse,
  EventStats,
  EventTypeResponse,
  GetEventsParams,
  RegisterEventBody,
  UpdateEventBody,
} from './types'
import apiClient, { type ApiResponse } from './client'

export const eventsApi = {
  getAll (params?: GetEventsParams): Promise<ApiResponse<EventResponse[]>> {
    return apiClient.get('/events', { params })
  },

  getOne (guid: string): Promise<ApiResponse<EventResponse>> {
    return apiClient.get('/events/one', { params: { guid } })
  },

  getTypes (): Promise<ApiResponse<EventTypeResponse[]>> {
    return apiClient.get('/events/types')
  },

  createType (body: { name: string }): Promise<ApiResponse<EventTypeResponse>> {
    return apiClient.post('/events/types/create', body)
  },

  updateType (body: { guid: string, name: string }): Promise<ApiResponse<EventTypeResponse>> {
    return apiClient.post('/events/types/update', body)
  },

  removeType (body: { guid: string }): Promise<ApiResponse<void>> {
    return apiClient.delete('/events/types', { data: body })
  },

  getStats (): Promise<ApiResponse<EventStats>> {
    return apiClient.get('/events/stats')
  },

  getMy (): Promise<ApiResponse<EventResponse[]>> {
    return apiClient.get('/events/my')
  },

  register (body: RegisterEventBody): Promise<ApiResponse<{ guid: string }>> {
    return apiClient.post('/events/register', body)
  },

  attend (registrationGuid: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post('/events/attend', { registrationGuid })
  },

  checkRegistration (guidEvent: string): Promise<ApiResponse<{ guid: string } | null>> {
    return apiClient.get('/events/registration', { params: { guidEvent } })
  },

  create (body: CreateEventBody): Promise<ApiResponse<EventResponse>> {
    return apiClient.post('/events/create', body)
  },

  update (body: UpdateEventBody): Promise<ApiResponse<EventResponse>> {
    return apiClient.post('/events/update', body)
  },

  remove (body: DeleteEventBody): Promise<ApiResponse<void>> {
    return apiClient.delete('/events', { data: body })
  },
}
