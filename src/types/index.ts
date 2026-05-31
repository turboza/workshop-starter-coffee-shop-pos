export type Category = 'Coffee' | 'Tea' | 'Pastry' | 'Cold drinks' | 'Specials'

export type MilkOption = 'Whole' | 'Skim' | 'Oat' | 'Soy' | 'Almond'
export type SizeOption = 'S 12oz' | 'M 16oz' | 'L 20oz'
export type ExtraOption = 'Extra shot' | 'Decaf' | 'Less sugar' | 'No foam'

export interface CustomOptions {
  size: SizeOption
  milk: MilkOption
  extras: ExtraOption[]
  note: string
}

export interface Product {
  id: string
  name: string
  category: Category
  price: number
  soldOut?: boolean
  customizable?: boolean
}

export interface CartItem {
  id: string
  product: Product
  options: Partial<CustomOptions>
  quantity: number
  unitPrice: number
}

export type PaymentMethod = 'cash' | 'card'

export interface Order {
  id: number
  items: CartItem[]
  subtotal: number
  vat: number
  total: number
  paymentMethod: PaymentMethod
  cashReceived?: number
  change?: number
  cashier: string
  timestamp: string
  voided?: boolean
  voidReason?: string
}
