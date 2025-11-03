export interface PeriodMetrics {
  followers: number
  followerGrowth: number
  posts: number
  reach: number
  impressions: number
  engagementRate: number
  totalEngagements: number
  linkClicks?: number // Clicks on links including WhatsApp
  leads?: number
}

export interface SocialMediaMetrics {
  platform: "instagram" | "facebook"
  followers: number
  posts: number
  reach: number
  impressions: number
  engagementRate: number
  totalEngagements: number
}

export interface SalesMetrics {
  contacted: number
  active: number
  closed: number
  conversionRate: number
  avgDealValue: number
  totalRevenue: number
}

export interface PerformanceData {
  month: string
  cerrados: number
  contactados: number
  activos: number
  publicaciones?: number
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
  socialMediaBreakdown?: SocialMediaMetrics[]
  salesMetrics?: SalesMetrics
  performanceHistory?: PerformanceData[]
}
