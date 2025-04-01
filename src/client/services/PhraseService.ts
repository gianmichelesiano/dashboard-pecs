import type { CancelablePromise } from "../core/CancelablePromise"
import { OpenAPI } from "../core/OpenAPI"
import { request as __request } from "../core/request"
import {
  PhraseCreate,
  PhraseRead,
  PhraseUpdate,
  PhrasePECSRead,
  Message,
} from "../types.gen"

export class PhraseService {
  /**
   * Get All Phrases
   * Retrieve all phrases.
   * @param skip
   * @param limit
   * @returns PhraseRead[] Successful Response
   * @throws ApiError
   */
  public static getAllPhrases(
    skip: number = 0,
    limit: number = 100,
  ): CancelablePromise<Array<PhraseRead>> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/phrases/",
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
   * Create Phrase
   * Create a new phrase.
   * @param requestBody
   * @returns PhraseRead Successful Response
   * @throws ApiError
   */
  public static createPhrase(data: {
    requestBody: PhraseCreate
  }): CancelablePromise<PhraseRead> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/phrases/",
      body: data.requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  

  /**
   * Get Phrase
   * Retrieve a specific phrase by ID.
   * @param phraseId
   * @returns PhraseRead Successful Response
   * @throws ApiError
   */
  public static getPhrase(phraseId: string): CancelablePromise<PhraseRead> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/phrases/{phrase_id}",
      path: {
        phrase_id: phraseId,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Transform PECS Format
   * Transform PECS items from the input format to the output format with tokens and phrases.
   * @param pecs Array of PECS items to transform
   * @returns Transformed PECS items
   * @throws ApiError
   */
  public static transformPecsFormat(data: {
    pecs: Array<{
      id: string;
      image_url: string;
      name: string;
      position: number;
    }>;
    language: string;
  }): CancelablePromise<Array<{
    id: string;
    token: string;
    phrase: string;
    position: number;
  }>> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/phrases/transform-pecs",
      body: data,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    });
  }

  /**
   * Update Phrase
   * Update a phrase.
   * @param phraseId
   * @param requestBody
   * @returns PhraseRead Successful Response
   * @throws ApiError
   */
  public static updatePhrase(
    phraseId: string,
    requestBody: PhraseUpdate,
  ): CancelablePromise<PhraseRead> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/phrases/{phrase_id}",
      path: {
        phrase_id: phraseId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Delete Phrase
   * Delete a phrase.
   * @param phraseId
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deletePhrase(phraseId: string): CancelablePromise<Message> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/phrases/{phrase_id}",
      path: {
        phrase_id: phraseId,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Get PECS In Phrase
   * Retrieve all PECS in a specific phrase with their positions.
   * @param phraseId
   * @returns PhrasePECSRead[] Successful Response
   * @throws ApiError
   */
  public static getPecsInPhrase(
    phraseId: string,
  ): CancelablePromise<Array<PhrasePECSRead>> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/phrases/{phrase_id}/pecs",
      path: {
        phrase_id: phraseId,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Add PECS To Phrase
   * Add a PECS to a phrase at a specific position.
   * @param phraseId
   * @param pecsId
   * @param position Position of the PECS in the phrase
   * @returns PhrasePECSRead Successful Response
   * @throws ApiError
   */
  public static addPecsToPhrase(
    phraseId: string,
    pecsId: string,
    position: number,
  ): CancelablePromise<PhrasePECSRead> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/phrases/{phrase_id}/pecs/{pecs_id}",
      path: {
        phrase_id: phraseId,
        pecs_id: pecsId,
      },
      query: {
        position: position,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Update PECS Position In Phrase
   * Update the position of a PECS in a phrase.
   * @param phraseId
   * @param pecsId
   * @param position New position of the PECS in the phrase
   * @returns PhrasePECSRead Successful Response
   * @throws ApiError
   */
  public static updatePecsPositionInPhrase(
    phraseId: string,
    pecsId: string,
    position: number,
  ): CancelablePromise<PhrasePECSRead> {
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/phrases/{phrase_id}/pecs/{pecs_id}",
      path: {
        phrase_id: phraseId,
        pecs_id: pecsId,
      },
      query: {
        position: position,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }

  /**
   * Remove PECS From Phrase
   * Remove a PECS from a phrase.
   * @param phraseId
   * @param pecsId
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static removePecsFromPhrase(
    phraseId: string,
    pecsId: string,
  ): CancelablePromise<Message> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/phrases/{phrase_id}/pecs/{pecs_id}",
      path: {
        phrase_id: phraseId,
        pecs_id: pecsId,
      },
      errors: {
        422: "Validation Error",
      },
    })
  }
}
