import { Product } from '@/src/types'

export const products: Product[] = [
  // Coffee
  { id: 'c1', name: 'Latte', category: 'Coffee', price: 95, customizable: true },
  { id: 'c2', name: 'Iced Latte', category: 'Coffee', price: 105, customizable: true },
  { id: 'c3', name: 'Americano', category: 'Coffee', price: 75, customizable: true },
  { id: 'c4', name: 'Iced Americano', category: 'Coffee', price: 80, customizable: true },
  { id: 'c5', name: 'Cappuccino', category: 'Coffee', price: 95, customizable: true },
  { id: 'c6', name: 'Mocha', category: 'Coffee', price: 110, customizable: true },
  { id: 'c7', name: 'Espresso', category: 'Coffee', price: 65, soldOut: true, customizable: false },
  { id: 'c8', name: 'Flat White', category: 'Coffee', price: 100, customizable: true },
  { id: 'c9', name: 'Signature Latte', category: 'Coffee', price: 120, customizable: true },
  { id: 'c10', name: 'Matcha Latte', category: 'Coffee', price: 120, customizable: true },

  // Tea
  { id: 't1', name: 'Thai Milk Tea', category: 'Tea', price: 75, customizable: true },
  { id: 't2', name: 'Oolong Latte', category: 'Tea', price: 90, customizable: true },
  { id: 't3', name: 'Chamomile', category: 'Tea', price: 65 },
  { id: 't4', name: 'Jasmine Green', category: 'Tea', price: 65 },
  { id: 't5', name: 'Earl Grey Latte', category: 'Tea', price: 85, customizable: true },

  // Pastry
  { id: 'p1', name: 'Croissant', category: 'Pastry', price: 85 },
  { id: 'p2', name: 'Pain au choc', category: 'Pastry', price: 95 },
  { id: 'p3', name: 'Banana Bread', category: 'Pastry', price: 75 },
  { id: 'p4', name: 'Muffin', category: 'Pastry', price: 65 },
  { id: 'p5', name: 'Kouign-amann', category: 'Pastry', price: 105 },

  // Cold drinks
  { id: 'cd1', name: 'Lemonade', category: 'Cold drinks', price: 75 },
  { id: 'cd2', name: 'Sparkling Water', category: 'Cold drinks', price: 45 },
  { id: 'cd3', name: 'Orange Juice', category: 'Cold drinks', price: 85 },
  { id: 'cd4', name: 'Cold Brew', category: 'Cold drinks', price: 95, customizable: true },
  { id: 'cd5', name: 'Iced Matcha', category: 'Cold drinks', price: 110, customizable: true },

  // Specials
  { id: 's1', name: 'Dalgona Coffee', category: 'Specials', price: 135, customizable: true },
  { id: 's2', name: 'Brown Sugar Latte', category: 'Specials', price: 145, customizable: true },
  { id: 's3', name: 'Lavender Latte', category: 'Specials', price: 130, customizable: true },
  { id: 's4', name: 'Hojicha Latte', category: 'Specials', price: 125, customizable: true },
  { id: 's5', name: 'Rose Oat Latte', category: 'Specials', price: 140, customizable: true },
]

export const sizeUpcharge: Record<string, number> = {
  'S 12oz': 0,
  'M 16oz': 15,
  'L 20oz': 25,
}

export const milkUpcharge: Record<string, number> = {
  'Whole': 0,
  'Skim': 0,
  'Oat': 20,
  'Soy': 15,
  'Almond': 20,
}

export const extraUpcharge: Record<string, number> = {
  'Extra shot': 20,
  'Decaf': 0,
  'Less sugar': 0,
  'No foam': 0,
}
