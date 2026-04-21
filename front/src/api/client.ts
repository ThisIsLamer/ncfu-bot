import axios, { AxiosError, type AxiosResponse } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

export type ApiResponse<T> = AxiosResponse<T> | AxiosError<T>

export function isApiError<T = unknown> (response: ApiResponse<T>): response is AxiosError<T> {
  return response instanceof AxiosError
}

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/webapp/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use(config => {
  // const token = window.WebApp?.initData || '11111'
  const token = '11111'
  if (token) {
    config.headers.Authorization = token
  }
  return config
})

// Перехватываем ошибки — промис всегда резолвится
apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const { useSnackbar } = await import('@/stores/snackbar')
    const snackbar = useSnackbar()
    const data = error.response?.data as Record<string, unknown> | undefined
    const message = (data?.message as string) ?? error.message ?? 'Произошла ошибка'
    snackbar.show(message)
    return error
  },
)

export default apiClient
