import type { User } from './auth'

export interface DashboardStats {
  total_users: number
  total_pelayan: number
  total_kasir: number
  total_admin: number
  active_users: number
  inactive_users: number
}

export interface RecentUser extends User {
  created_at: string
}

export interface UsersByRole {
  admin: number
  kasir: number
  pelayan: number
}

export interface DashboardResponse {
  success: boolean
  data: {
    stats: DashboardStats
    recent_users: RecentUser[]
    users_by_role: UsersByRole
  }
}

export interface UsersResponse {
  success: boolean
  data: {
    users: User[]
    pagination: {
      current_page: number
      last_page: number
      per_page: number
      total: number
    }
  }
}
