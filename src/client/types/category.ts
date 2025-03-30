export type CategoryCreate = {
  name: string
  icon?: string
  color: string
  display_order?: number
  is_custom?: boolean
  is_visible?: boolean
  parent_id?: string
  lang?: string
}

export type CategoryPublic = {
  name: string
  icon: string
  color: string
  display_order: number
  is_custom: boolean
  is_visible: boolean
  created_by: string
  id: string
}

export type CategoryTranslation = {
  language_code: string
  name: string
  id: string
  category_id: string
}

export type CategoryWithTranslations = {
  parent_id: string | null
  id: string
  created_at: string
  translations: CategoryTranslation[]
}

export type CategoryUpdate = {
  name?: string
  icon?: string
  color?: string
  display_order?: number
  is_custom?: boolean
  is_visible?: boolean
}

export type CategoriesPublic = {
  data: Array<CategoryPublic>
  count: number
}

export type CategoriesReadCategoriesData = {
  limit?: number
  skip?: number
}

export type CategoriesReadCategoriesResponse = CategoriesPublic

export type CategoriesCreateCategoryData = {
  requestBody: CategoryCreate
}

export type CategoriesCreateCategoryResponse = CategoryPublic

export type CategoriesReadCategoryData = {
  id: string
}

export type CategoriesReadCategoryResponse = CategoryPublic

export type CategoriesUpdateCategoryData = {
  id: string
  requestBody: CategoryUpdate
}

export type CategoriesUpdateCategoryResponse = CategoryPublic

export type CategoriesDeleteCategoryData = {
  id: string
}

export type CategoriesDeleteCategoryResponse = { message: string }

export type CategoriesReadCategoriesByLanguageData = {
  code: string
}

export type CategoriesReadCategoriesByLanguageResponse =
  CategoryWithTranslations[]

interface Translation {
  language_code: string
  name: string
}

interface Category {
  id: string
  translations: Translation[]
}

export type CategoryResponse = Category[]
