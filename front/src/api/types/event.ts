// --- Response types (from EventPresenter) ---

export interface EventTypeResponse {
  guid: string
  name: string
}

export interface EventResponse {
  guid: string
  title: string
  description: string
  date: string
  location: string
  capacity: number
  registered: number
  color: string
  types: string[]
  createdAt: string
  updatedAt: string
}

// --- Request DTOs ---

export interface GetEventsParams {
  search?: string
  filter?: string[]
}

export interface RegisterEventBody {
  guidEvent: string
}

export interface CreateEventBody {
  title: string
  description: string
  date: string
  location: string
  capacity: number
  colors: string
  types: string[]
}

export interface UpdateEventBody {
  guid: string
  title?: string
  description?: string
  date?: string
  location?: string
  capacity?: number
  colors?: string
  types?: string[]
}

export interface DeleteEventBody {
  guid: string
}

// --- Stats ---

export interface EventStatItem {
  guid: string
  title: string
  date: string
  capacity: number
  registered: number
  attended: number
  fillRate: number
  attendRate: number
  types: string[]
}

export interface EventStats {
  totalEvents: number
  totalUsers: number
  totalRegistrations: number
  totalAttended: number
  attendanceRate: number
  events: EventStatItem[]
  byType: { name: string, count: number }[]
}
