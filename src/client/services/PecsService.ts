import type { CancelablePromise } from "../core/CancelablePromise"
import { OpenAPI } from "../core/OpenAPI"
import { request as __request } from "../core/request"
import {
  PecsReadPecsData,
  PecsReadPecsResponse,
  PecsReadCustomPecsData,
  PecsReadCustomPecsResponse,
  PecsCreatePecsData,
  PecsCreatePecsResponse,
  PecsReadPecsByIdData,
  PecsReadPecsByIdResponse,
  PecsUpdatePecsData,
  PecsUpdatePecsResponse,
  PecsDeletePecsData,
  PecsDeletePecsResponse,
} from "../types/pecs"

export class PecsService {
  /**
   * Read All PECS
   * Retrieve all PECS with optional language filter.
   * @param data The data for the request.
   * @param data.skip
   * @param data.limit
   * @param data.language Optional language code to filter PECS
   * @returns PecsReadPecsResponse Successful Response
   * @throws ApiError
   */
  public static readPecs(
    data: PecsReadPecsData = {},
  ): CancelablePromise<PecsReadPecsResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/pecs/",
      query: {
        skip: data.skip,
        limit: data.limit,
        language: data.language,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Custom PECS
   * Retrieve custom PECS created by the current user.
   * @param data The data for the request.
   * @param data.skip
   * @param data.limit
   * @returns PecsReadCustomPecsResponse Successful Response
   * @throws ApiError
   */
  public static readCustomPecs(
    data: PecsReadCustomPecsData = {},
  ): CancelablePromise<PecsReadCustomPecsResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/pecs/custom",
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
   * Create PECS
   * Create a new PECS.
   * @param data The data for the request.
   * @param data.requestBody
   * @returns PecsCreatePecsResponse Successful Response
   * @throws ApiError
   */
  public static createPecs(
    data: PecsCreatePecsData,
  ): CancelablePromise<PecsCreatePecsResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/pecs/",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read PECS by ID
   * Retrieve a specific PECS by ID.
   * @param data The data for the request.
   * @param data.id
   * @returns PecsReadPecsByIdResponse Successful Response
   * @throws ApiError
   */
  public static readPecsById(
    data: PecsReadPecsByIdData,
  ): CancelablePromise<PecsReadPecsByIdResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/pecs/{id}",
      path: {
        id: data.id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Update PECS
   * Update a PECS.
   * @param data The data for the request.
   * @param data.pecsId
   * @param data.requestBody
   * @returns PecsUpdatePecsResponse Successful Response
   * @throws ApiError
   */
  public static updatePecs(
    data: PecsUpdatePecsData,
  ): CancelablePromise<PecsUpdatePecsResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/pecs/{id}",
      path: {
        id: data.pecsId,
      },
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Delete PECS
   * Delete a PECS.
   * @param data The data for the request.
   * @param data.pecsId
   * @returns PecsDeletePecsResponse Successful Response
   * @throws ApiError
   */
  public static deletePecs(
    data: PecsDeletePecsData,
  ): CancelablePromise<PecsDeletePecsResponse> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/pecs/{id}",
      path: {
        id: data.pecsId,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }
}
