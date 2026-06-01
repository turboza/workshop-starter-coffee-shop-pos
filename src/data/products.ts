import { Product } from '@/src/types'

export const products: Product[] = [
  // Coffee
  { id: 'c1', name: 'Latte', category: 'Coffee', price: 95, customizable: true, image: '/menu/latte.jpg' },
  { id: 'c2', name: 'Iced Latte', category: 'Coffee', price: 105, customizable: true, image: '/menu/iced-latte.jpg' },
  { id: 'c3', name: 'Americano', category: 'Coffee', price: 75, customizable: true, image: '/menu/americano.jpg' },
  { id: 'c4', name: 'Iced Americano', category: 'Coffee', price: 80, customizable: true, image: '/menu/iced-americano.jpg' },
  { id: 'c5', name: 'Cappuccino', category: 'Coffee', price: 95, customizable: true, image: '/menu/cappuccino.jpg' },
  { id: 'c6', name: 'Mocha', category: 'Coffee', price: 110, customizable: true, image: '/menu/mocha.jpg' },
  { id: 'c7', name: 'Espresso', category: 'Coffee', price: 65, soldOut: true, customizable: false, image: '/menu/espresso.jpg' },
  { id: 'c8', name: 'Flat White', category: 'Coffee', price: 100, customizable: true, image: '/menu/flat-white.jpg' },
  { id: 'c9', name: 'Signature Latte', category: 'Coffee', price: 120, customizable: true, image: '/menu/sig-latte.jpg' },
  { id: 'c10', name: 'Matcha Latte', category: 'Coffee', price: 120, customizable: true, image: '/menu/matcha-latte.jpg' },

  // Tea
  { id: 't1', name: 'Thai Milk Tea', category: 'Tea', price: 75, customizable: true, image: '/menu/thai-tea.jpg' },
  { id: 't2', name: 'Oolong Latte', category: 'Tea', price: 90, customizable: true, image: '/menu/oolong.jpg' },
  { id: 't3', name: 'Chamomile', category: 'Tea', price: 65, image: '/menu/chamomile.jpg' },
  { id: 't4', name: 'Jasmine Green', category: 'Tea', price: 65, image: '/menu/jasmine-green.jpg' },
  { id: 't5', name: 'Earl Grey Latte', category: 'Tea', price: 85, customizable: true, image: '/menu/earl-grey.jpg' },

  // Pastry
  { id: 'p1', name: 'Croissant', category: 'Pastry', price: 85, image: '/menu/croissant.jpg' },
  { id: 'p2', name: 'Pain au choc', category: 'Pastry', price: 95, image: '/menu/pain-au-choc.jpg' },
  { id: 'p3', name: 'Banana Bread', category: 'Pastry', price: 75, image: '/menu/banana-bread.jpg' },
  { id: 'p4', name: 'Muffin', category: 'Pastry', price: 65, image: '/menu/muffin.jpg' },
  { id: 'p5', name: 'Kouign-amann', category: 'Pastry', price: 105, image: '/menu/kouign-amann.jpg' },

  // Cold drinks
  { id: 'cd1', name: 'Lemonade', category: 'Cold drinks', price: 75, image: '/menu/lemonade.jpg' },
  { id: 'cd2', name: 'Sparkling Water', category: 'Cold drinks', price: 45, image: '/menu/sparkling.jpg' },
  { id: 'cd3', name: 'Orange Juice', category: 'Cold drinks', price: 85, image: '/menu/fresh-orange.jpg' },
  { id: 'cd4', name: 'Cold Brew', category: 'Cold drinks', price: 95, customizable: true, image: '/menu/cold-brew.jpg' },
  { id: 'cd5', name: 'Iced Matcha', category: 'Cold drinks', price: 110, customizable: true, image: '/menu/iced-matcha.jpg' },

  // Specials
  { id: 's1', name: 'Dalgona Coffee', category: 'Specials', price: 135, customizable: true, image: '/menu/dalgona-coffee.jpg' },
  { id: 's2', name: 'Brown Sugar Latte', category: 'Specials', price: 145, customizable: true, image: '/menu/brown-sugar-latte.jpg' },
  { id: 's3', name: 'Lavender Latte', category: 'Specials', price: 130, customizable: true, image: '/menu/lavender-latte.jpg' },
  { id: 's4', name: 'Hojicha Latte', category: 'Specials', price: 125, customizable: true, image: '/menu/hojicha-latte.jpg' },
  { id: 's5', name: 'Rose Oat Latte', category: 'Specials', price: 140, customizable: true, image: '/menu/rose-oat-latte.jpg' },
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
