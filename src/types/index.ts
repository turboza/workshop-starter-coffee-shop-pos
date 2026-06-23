export type Category = 'Coffee' | 'Tea' | 'Pastry' | 'Cold drinks' | 'Specials'

export type StockStatus = 'below' | 'approaching' | 'ok'

export interface Ingredient {
  id: string
  name: string
  unit: string
  count: number  // human units (count_h / 100)
  par: number    // human units (par_h / 100)
}

export interface StockAdjustment {
  id: string
  ingredientId: string
  previous: number
  next: number
  delta: number
  reason: string
  cashier: string
  timestamp: string
}

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
  image?: string
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
