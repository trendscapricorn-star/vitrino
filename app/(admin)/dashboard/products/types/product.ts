export type ProductImage = {
  id: string
  image_url: string
  sort_order: number
}

export type Variant = {
  id: string
}

export type Category = {
  id: string
  name: string
}

export type Product = {
  id: string
  name: string
  category_id: string
  base_price: number | null
  description: string | null
  is_active: boolean
  product_images?: ProductImage[] | null
  variants?: Variant[] | null
  category?: Category | null
}