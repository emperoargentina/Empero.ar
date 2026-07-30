// src/types/family.ts

export interface ProductFamily {
  id: string
  nombre: string
  categoria: string | null
  cloudinary_url: string | null
  cloudinary_image_id: string | null
  caracteristicas_generales: string[] | null
  created_at: string
  updated_at: string
}

export type FamilyInsert = Omit<ProductFamily, 'id' | 'created_at' | 'updated_at'> & { id?: string }
export type FamilyUpdate = Partial<FamilyInsert>
