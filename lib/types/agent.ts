export interface PeriodMetrics {
  followers: number
  followerGrowth: number
  posts: number
  reach: number
  impressions: number
  engagementRate: number
  totalEngagements: number
  leads?: number
}

export interface Agent {
  id: string
  name: string
  email: string
  avatar?: string
  phone?: string
  status: "active" | "inactive" | "pending"
  joinDate: string
  totalProperties: number
  monthlyMetrics: PeriodMetrics
  weeklyMetrics: PeriodMetrics
  historicalMetrics: PeriodMetrics[]
  instagramHandle?: string
  facebookHandle?: string
}
