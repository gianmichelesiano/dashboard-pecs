import type { CancelablePromise } from "../core/CancelablePromise"
import { OpenAPI } from "../core/OpenAPI"
import { request as __request } from "../core/request"
import {
  SequencesReadGroupsData,
  SequencesReadGroupsResponse,
  SequencesCreateGroupData,
  SequencesCreateGroupResponse,
  SequencesReadGroupData,
  SequencesReadGroupResponse,
  SequencesUpdateGroupData,
  SequencesUpdateGroupResponse,
  SequencesDeleteGroupData,
  SequencesDeleteGroupResponse,
  SequencesReadSequencesData,
  SequencesReadSequencesResponse,
  SequencesCreateSequenceData,
  SequencesCreateSequenceResponse,
  SequencesReadSequenceData,
  SequencesReadSequenceResponse,
  SequencesUpdateSequenceData,
  SequencesUpdateSequenceResponse,
  SequencesDeleteSequenceData,
  SequencesDeleteSequenceResponse,
  SequencesReadItemsData,
  SequencesReadItemsResponse,
  SequencesCreateItemData,
  SequencesCreateItemResponse,
  SequencesUpdateItemData,
  SequencesUpdateItemResponse,
  SequencesDeleteItemData,
  SequencesDeleteItemResponse,
  SequencesReorderItemsData,
  SequencesReorderItemsResponse,
} from "../types/sequence"

export class SequenceService {
  /**
   * Read Sequence Groups
   * @param data The data for the request.
   * @returns SequenceGroupRead[] Successful Response
   * @throws ApiError
   */
  public static readSequenceGroups(
    data: SequencesReadGroupsData = {},
  ): CancelablePromise<SequencesReadGroupsResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/sequences/groups/",
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
   * Create Sequence Group
   * @param data The data for the request.
   * @returns SequenceGroupRead Successful Response
   * @throws ApiError
   */
  public static createSequenceGroup(
    data: SequencesCreateGroupData,
  ): CancelablePromise<SequencesCreateGroupResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/sequences/groups/",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Sequence Group
   * @param data The data for the request.
   * @returns SequenceGroupRead Successful Response
   * @throws ApiError
   */
  public static readSequenceGroup(
    data: SequencesReadGroupData,
  ): CancelablePromise<SequencesReadGroupResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/sequences/groups/{id}",
      path: {
        id: data.id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Update Sequence Group
   * @param data The data for the request.
   * @returns SequenceGroupRead Successful Response
   * @throws ApiError
   */
  public static updateSequenceGroup(
    data: SequencesUpdateGroupData,
  ): CancelablePromise<SequencesUpdateGroupResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/sequences/groups/{id}",
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
   * Delete Sequence Group
   * @param data The data for the request.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteSequenceGroup(
    data: SequencesDeleteGroupData,
  ): CancelablePromise<SequencesDeleteGroupResponse> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/sequences/groups/{id}",
      path: {
        id: data.id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Sequences
   * @param data The data for the request.
   * @returns SequenceRead[] Successful Response
   * @throws ApiError
   */
  public static readSequences(
    data: SequencesReadSequencesData = {},
  ): CancelablePromise<SequencesReadSequencesResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/sequences/",
      query: {
        skip: data.skip,
        limit: data.limit,
        group_id: data.group_id,
        is_favorite: data.is_favorite,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Create Sequence
   * @param data The data for the request.
   * @returns SequenceRead Successful Response
   * @throws ApiError
   */
  public static createSequence(
    data: SequencesCreateSequenceData,
  ): CancelablePromise<SequencesCreateSequenceResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/sequences/",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Sequence
   * @param data The data for the request.
   * @returns SequenceRead Successful Response
   * @throws ApiError
   */
  public static readSequence(
    data: SequencesReadSequenceData,
  ): CancelablePromise<SequencesReadSequenceResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/sequences/{id}",
      path: {
        id: data.id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Update Sequence
   * @param data The data for the request.
   * @returns SequenceRead Successful Response
   * @throws ApiError
   */
  public static updateSequence(
    data: SequencesUpdateSequenceData,
  ): CancelablePromise<SequencesUpdateSequenceResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/sequences/{id}",
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
   * Delete Sequence
   * @param data The data for the request.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteSequence(
    data: SequencesDeleteSequenceData,
  ): CancelablePromise<SequencesDeleteSequenceResponse> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/sequences/{id}",
      path: {
        id: data.id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Read Sequence Items
   * @param data The data for the request.
   * @returns SequenceItemRead[] Successful Response
   * @throws ApiError
   */
  public static readSequenceItems(
    data: SequencesReadItemsData,
  ): CancelablePromise<SequencesReadItemsResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/sequences/{sequence_id}/items/",
      path: {
        sequence_id: data.sequence_id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Create Sequence Item
   * @param data The data for the request.
   * @returns SequenceItemRead Successful Response
   * @throws ApiError
   */
  public static createSequenceItem(
    data: SequencesCreateItemData,
  ): CancelablePromise<SequencesCreateItemResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/sequences/{sequence_id}/items/",
      path: {
        sequence_id: data.sequence_id,
      },
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Update Sequence Item
   * @param data The data for the request.
   * @returns SequenceItemRead Successful Response
   * @throws ApiError
   */
  public static updateSequenceItem(
    data: SequencesUpdateItemData,
  ): CancelablePromise<SequencesUpdateItemResponse> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/sequences/{sequence_id}/items/{item_id}",
      path: {
        sequence_id: data.sequence_id,
        item_id: data.item_id,
      },
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Delete Sequence Item
   * @param data The data for the request.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteSequenceItem(
    data: SequencesDeleteItemData,
  ): CancelablePromise<SequencesDeleteItemResponse> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/sequences/{sequence_id}/items/{item_id}",
      path: {
        sequence_id: data.sequence_id,
        item_id: data.item_id,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Reorder Sequence Items
   * @param data The data for the request.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static reorderSequenceItems(
    data: SequencesReorderItemsData,
  ): CancelablePromise<SequencesReorderItemsResponse> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/sequences/{sequence_id}/reorder",
      path: {
        sequence_id: data.sequence_id,
      },
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }
}
