import type { CancelablePromise } from "../core/CancelablePromise"
import { OpenAPI } from "../core/OpenAPI"
import { request as __request } from "../core/request"
import {
  PictogramsReadPictogramsData,
  PictogramsReadPictogramsResponse,
  PictogramsCreatePictogramData,
  PictogramsCreatePictogramResponse,
  PictogramsReadPictogramData,
  PictogramsReadPictogramResponse,
  PictogramsUpdatePictogramData,
  PictogramsUpdatePictogramResponse,
  PictogramsDeletePictogramData,
  PictogramsDeletePictogramResponse,
} from "../types/pictogram"

import { CategoryResponse } from "../types/category"

export class PictogramService {
  /**
   * Read Pictograms
   * Retrieve pictograms.
   * @param data The data for the request.
   * @param data.skip
   * @param data.limit
   * @param data.category_id Optional category ID to filter pictograms
   * @returns PictogramsPublic Successful Response
   * @throws ApiError
   */
  public static readPictograms(
    data: PictogramsReadPictogramsData = {},
  ): CancelablePromise<PictogramsReadPictogramsResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/pictograms/",
      query: {
        skip: data.skip,
        limit: data.limit,
        category_id: data.category_id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Create Pictogram
   * Create new pictogram.
   * @param data The data for the request.
   * @param data.requestBody
   * @returns PictogramPublic Successful Response
   * @throws ApiError
   */
  public static createPictogram(
    data: PictogramsCreatePictogramData,
  ): CancelablePromise<PictogramsCreatePictogramResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/pictograms/",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Pictogram
   * Get pictogram by ID.
   * @param data The data for the request.
   * @param data.id
   * @returns PictogramPublic Successful Response
   * @throws ApiError
   */
  public static readPictogram(
    data: PictogramsReadPictogramData,
  ): CancelablePromise<PictogramsReadPictogramResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/pictograms/{id}",
      path: {
        id: data.id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Show Category
   * Get category by PECS ID.
   * @param data The data for the request.
   * @param data.pecsId The ID of the PECS
   * @returns CategoryResponse Successful Response
   * @throws ApiError
   */
  public static showCategory(data: {
    pecsId: string
  }): CancelablePromise<CategoryResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/pecs/{pecsId}/category",
      path: {
        pecsId: data.pecsId,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Update Pictogram
   * Update a pictogram.
   * @param data The data for the request.
   * @param data.id
   * @param data.requestBody
   * @returns PictogramPublic Successful Response
   * @throws ApiError
   */
  public static updatePictogram(
    data: PictogramsUpdatePictogramData,
  ): CancelablePromise<PictogramsUpdatePictogramResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/pictograms/{id}",
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
   * Delete Pictogram
   * Delete a pictogram.
   * @param data The data for the request.
   * @param data.id
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deletePictogram(
    data: PictogramsDeletePictogramData,
  ): CancelablePromise<PictogramsDeletePictogramResponse> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/pictograms/{id}",
      path: {
        id: data.id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }
}
