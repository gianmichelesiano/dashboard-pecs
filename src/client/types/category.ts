export type CategoryCreate = {
  name: string;
  icon?: string;
  color: string;
  display_order?: number;
  is_custom?: boolean;
  is_visible?: boolean;
};

export type CategoryPublic = {
  name: string;
  icon: string;
  color: string;
  display_order: number;
  is_custom: boolean;
  is_visible: boolean;
  created_by: string;
  id: string;
};

export type CategoryUpdate = {
  name?: string;
  icon?: string;
  color?: string;
  display_order?: number;
  is_custom?: boolean;
  is_visible?: boolean;
};

export type CategoriesPublic = {
  data: Array<CategoryPublic>;
  count: number;
};

export type CategoriesReadCategoriesData = {
  limit?: number;
  skip?: number;
};

export type CategoriesReadCategoriesResponse = CategoriesPublic;

export type CategoriesCreateCategoryData = {
  requestBody: CategoryCreate;
};

export type CategoriesCreateCategoryResponse = CategoryPublic;

export type CategoriesReadCategoryData = {
  id: string;
};

export type CategoriesReadCategoryResponse = CategoryPublic;

export type CategoriesUpdateCategoryData = {
  id: string;
  requestBody: CategoryUpdate;
};

export type CategoriesUpdateCategoryResponse = CategoryPublic;

export type CategoriesDeleteCategoryData = {
  id: string;
};

export type CategoriesDeleteCategoryResponse = { message: string };