import type { CancelablePromise } from "../core/CancelablePromise"
import { OpenAPI } from "../core/OpenAPI"
import { request as __request } from "../core/request"
import {
  CategoriesReadCategoriesData,
  CategoriesReadCategoriesResponse,
  CategoriesCreateCategoryData,
  CategoriesCreateCategoryResponse,
  CategoriesReadCategoryData,
  CategoriesReadCategoryResponse,
  CategoriesUpdateCategoryData,
  CategoriesUpdateCategoryResponse,
  CategoriesDeleteCategoryData,
  CategoriesDeleteCategoryResponse,
  CategoriesReadCategoriesByLanguageData,
  CategoriesReadCategoriesByLanguageResponse,
} from "../types/category"

export class CategoryService {
  /**
   * Read Categories
   * Retrieve categories.
   * @param data The data for the request.
   * @param data.skip
   * @param data.limit
   * @returns CategoriesPublic Successful Response
   * @throws ApiError
   */
  public static readCategories(
    data: CategoriesReadCategoriesData = {},
  ): CancelablePromise<CategoriesReadCategoriesResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/categories/",
      query: {
        skip: data.skip,
        limit: data.limit,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Create Category
   * Create new category.
   * @param data The data for the request.
   * @param data.requestBody
   * @returns CategoryPublic Successful Response
   * @throws ApiError
   */
  public static createCategory(
    data: CategoriesCreateCategoryData,
  ): CancelablePromise<CategoriesCreateCategoryResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/categories/",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Category
   * Get category by ID.
   * @param data The data for the request.
   * @param data.id
   * @returns CategoryPublic Successful Response
   * @throws ApiError
   */
  public static readCategory(
    data: CategoriesReadCategoryData,
  ): CancelablePromise<CategoriesReadCategoryResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/categories/{id}",
      path: {
        id: data.id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Update Category
   * Update a category.
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns CategoryPublic Successful Response
   * @throws ApiError
   */
  public static updateCategory(
    data: CategoriesUpdateCategoryData,
  ): CancelablePromise<CategoriesUpdateCategoryResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/categories/{id}",
      path: {
        id: data.id,
      },
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Delete Category
   * Delete a category.
   * @param data The data for the request.
   * @param data.id
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteCategory(
    data: CategoriesDeleteCategoryData,
  ): CancelablePromise<CategoriesDeleteCategoryResponse> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/categories/{id}",
      path: {
        id: data.id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Categories By Language
   * Retrieve categories by language code.
   * @param data The data for the request.
   * @param data.code The language code
   * @returns Categories with translations Successful Response
   * @throws ApiError
   */
  public static readCategoriesByLanguage(
    data: CategoriesReadCategoriesByLanguageData,
  ): CancelablePromise<CategoriesReadCategoriesByLanguageResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/categories/language/{code}",
      path: {
        code: data.code,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Category PECS
   * Retrieve PECS for a specific category.
   * @param data The data for the request.
   * @param data.id The category ID
   * @param data.skip Optional skip parameter
   * @param data.limit Optional limit parameter
   * @returns PECS for the category Successful Response
   * @throws ApiError
   */
  public static readCategoryPecs(data: {
    id: string
    skip?: number
    limit?: number
  }): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/categories/{id}/pecs",
      path: {
        id: data.id,
      },
      query: {
        skip: data.skip,
        limit: data.limit,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }
}
