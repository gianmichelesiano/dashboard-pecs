import type { CancelablePromise } from "../core/CancelablePromise"
import { OpenAPI } from "../core/OpenAPI"
import { request as __request } from "../core/request"
import {
  CollectionCreate,
  CollectionRead,
  CollectionUpdate,
  Message,
  PhraseRead,
} from "../types.gen"

export class CollectionService {
  /**
   * Get All Collections
   * Retrieve all collections.
   * @param skip
   * @param limit
   * @returns CollectionRead[] Successful Response
   * @throws ApiError
   */
  public static getAllCollections(
    skip: number = 0,
    limit: number = 100,
  ): CancelablePromise<Array<CollectionRead>> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/collections/",
      query: {
        skip: skip,
        limit: limit,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Create Collection
   * Create a new collection.
   * @param requestBody
   * @returns CollectionRead Successful Response
   * @throws ApiError
   */
  public static createCollection(data: {
    requestBody: CollectionCreate
  }): CancelablePromise<CollectionRead> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/collections/",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Get Collections By Language
   * Retrieve collections in a specific language.
   * @param code
   * @param skip
   * @param limit
   * @param name
   * @returns CollectionRead[] Successful Response
   * @throws ApiError
   */
  public static getCollectionsByLanguage(
    code: string,
    skip: number = 0,
    limit?: number,
    name?: string,
  ): CancelablePromise<Array<CollectionRead>> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/collections/language/{code}",
      path: {
        code: code,
      },
      query: {
        skip: skip,
        limit: limit,
        name: name,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Get Collection
   * Retrieve a specific collection by ID.
   * @param collectionId
   * @returns CollectionRead Successful Response
   * @throws ApiError
   */
  public static getCollection(
    collectionId: string,
  ): CancelablePromise<CollectionRead> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/collections/{collection_id}",
      path: {
        collection_id: collectionId,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Update Collection
   * Update a collection.
   * @param collectionId
   * @param requestBody
   * @returns CollectionRead Successful Response
   * @throws ApiError
   */
  public static updateCollection(
    collectionId: string,
    requestBody: CollectionUpdate,
  ): CancelablePromise<CollectionRead> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/collections/{collection_id}",
      path: {
        collection_id: collectionId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Delete Collection
   * Delete a collection.
   * @param collectionId
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteCollection(
    collectionId: string,
  ): CancelablePromise<Message> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/collections/{collection_id}",
      path: {
        collection_id: collectionId,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Get Phrases In Collection
   * Retrieve all phrases in a specific collection.
   * @param collectionId
   * @param skip
   * @param limit
   * @returns PhraseRead[] Successful Response
   * @throws ApiError
   */
  public static getPhrasesInCollection(
    collectionId: string,
    skip: number = 0,
    limit: number = 100,
  ): CancelablePromise<Array<PhraseRead>> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/collections/{collection_id}/phrases",
      path: {
        collection_id: collectionId,
      },
      query: {
        skip: skip,
        limit: limit,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Add Phrase To Collection
   * Add a phrase to a collection.
   * @param collectionId
   * @param phraseId
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static addPhraseToCollection(
    collectionId: string,
    phraseId: string,
  ): CancelablePromise<Message> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/collections/{collection_id}/phrases/{phrase_id}",
      path: {
        collection_id: collectionId,
        phrase_id: phraseId,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Remove Phrase From Collection
   * Remove a phrase from a collection.
   * @param collectionId
   * @param phraseId
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static removePhraseFromCollection(
    collectionId: string,
    phraseId: string,
  ): CancelablePromise<Message> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/collections/{collection_id}/phrases/{phrase_id}",
      path: {
        collection_id: collectionId,
        phrase_id: phraseId,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }
}
