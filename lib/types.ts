export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  role: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Beneficiary {
  id: string
  user_id: string
  name: string
  phone: string
  address?: string
  city: string
  country: string
  is_active: boolean
  created_at: Date
  updated_at: Date
}

export interface Subscription {
  id: string
  user_id: string
  beneficiary_id: string
  amount_cad: number
  frequency: string
  status: string
  next_transfer_date: Date
  created_at: Date
  updated_at: Date
}

export interface Transfer {
  id: string
  user_id: string
  beneficiary_id: string
  subscription_id?: string
  amount_cad: number
  amount_mga: number
  exchange_rate: number
  fee_cad: number
  total_cad: number
  type: string
  status: string
  confirmed_at?: Date
  confirmed_by?: string
  created_at: Date
  updated_at: Date
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  is_read: boolean
  created_at: Date
}

export interface DashboardStats {
  totalTransfers: number
  totalAmount: number
  activeSubscriptions: number
  pendingTransfers: number
}

export interface TransferCalculation {
  amountCAD: number
  amountMGA: number
  exchangeRate: number
  feeCAD: number
  totalCAD: number
}
