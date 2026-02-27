import { supabaseBrowser } from './supabase-browser'

export async function uploadProductImage({
  file,
  companyId,
  productId,
}: {
  file: File
  companyId: string
  productId: string
}) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `${companyId}/${productId}/${fileName}`

  const { error } = await supabaseBrowser.storage
    .from('product-images')
    .upload(filePath, file)

  if (error) {
    console.error(error)
    throw error
  }

  const { data } = supabaseBrowser.storage
    .from('product-images')
    .getPublicUrl(filePath)

  return data.publicUrl
}