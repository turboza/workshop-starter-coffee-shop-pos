'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'
import { CartItem, Order, PaymentMethod } from '@/src/types'

interface CartState {
  items: CartItem[]
  orderNumber: number
  cashier: string
  completedOrder: Order | null
}

type CartAction =
  | { type: 'ADD_ITEM'; item: CartItem }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'UPDATE_QTY'; itemId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'COMPLETE_ORDER'; order: Order }

function subtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        (i) =>
          i.product.id === action.item.product.id &&
          JSON.stringify(i.options) === JSON.stringify(action.item.options)
      )
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.id === existing.id
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i
          ),
        }
      }
      return { ...state, items: [...state.items, action.item] }
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.itemId) }
    case 'UPDATE_QTY':
      if (action.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.id !== action.itemId) }
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.itemId ? { ...i, quantity: action.quantity } : i
        ),
      }
    case 'COMPLETE_ORDER':
      return { ...state, completedOrder: action.order }
    case 'CLEAR_CART':
      return { ...state, items: [], orderNumber: state.orderNumber + 1, completedOrder: null }
    default:
      return state
  }
}

interface CartContextValue {
  items: CartItem[]
  orderNumber: number
  cashier: string
  completedOrder: Order | null
  subtotal: number
  vat: number
  total: number
  addItem: (item: CartItem) => void
  removeItem: (itemId: string) => void
  updateQty: (itemId: string, quantity: number) => void
  clearCart: () => void
  completeOrder: (paymentMethod: PaymentMethod, cashReceived?: number) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    orderNumber: 1284,
    cashier: 'Aey',
    completedOrder: null,
  })

  const sub = subtotal(state.items)
  const vat = Math.round(sub * 0.07)
  const total = sub + vat

  function addItem(item: CartItem) {
    dispatch({ type: 'ADD_ITEM', item })
  }

  function removeItem(itemId: string) {
    dispatch({ type: 'REMOVE_ITEM', itemId })
  }

  function updateQty(itemId: string, quantity: number) {
    dispatch({ type: 'UPDATE_QTY', itemId, quantity })
  }

  function clearCart() {
    dispatch({ type: 'CLEAR_CART' })
  }

  function completeOrder(paymentMethod: PaymentMethod, cashReceived?: number) {
    const order: Order = {
      id: state.orderNumber,
      items: state.items,
      subtotal: sub,
      vat,
      total,
      paymentMethod,
      cashReceived,
      change: cashReceived ? cashReceived - total : undefined,
      cashier: state.cashier,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      voided: false,
    }
    dispatch({ type: 'COMPLETE_ORDER', order })
  }

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        orderNumber: state.orderNumber,
        cashier: state.cashier,
        completedOrder: state.completedOrder,
        subtotal: sub,
        vat,
        total,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        completeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
