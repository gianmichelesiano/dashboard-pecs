export interface SequenceGroupBase {
  name: string
  icon?: string | null
  color: string
  display_order: number
}

export interface SequenceGroupCreate extends SequenceGroupBase {
  created_by?: string | null
}

export interface SequenceGroupUpdate {
  name?: string | null
  icon?: string | null
  color?: string | null
  display_order?: number | null
}

export interface SequenceGroupRead extends SequenceGroupBase {
  id: string
  created_at: string
  updated_at: string
  created_by?: string | null
}

export interface SequenceBase {
  name: string
  display_order: number
  is_favorite: boolean
  group_id?: string | null
}

export interface SequenceCreate extends SequenceBase {
  created_by?: string | null
  items?: Array<{
    pictogram_id: string
    position: number
  }> | null
}

export interface SequenceUpdate {
  name?: string | null
  display_order?: number | null
  is_favorite?: boolean | null
  group_id?: string | null
}

export interface SequenceRead extends SequenceBase {
  id: string
  created_at: string
  updated_at: string
  created_by?: string | null
}

export interface SequenceItemBase {
  sequence_id: string
  pictogram_id: string
  position: number
}

export interface SequenceItemCreate extends SequenceItemBase {}

export interface SequenceItemUpdate {
  position?: number | null
  pictogram_id?: string | null
}

export interface SequenceItemRead extends SequenceItemBase {
  id: string
  created_at: string
}

// Request/Response types
export interface SequencesReadGroupsData {
  skip?: number
  limit?: number
}

export type SequencesReadGroupsResponse = Array<SequenceGroupRead>

export interface SequencesCreateGroupData {
  requestBody: SequenceGroupCreate
}

export type SequencesCreateGroupResponse = SequenceGroupRead

export interface SequencesReadGroupData {
  id: string
}

export type SequencesReadGroupResponse = SequenceGroupRead

export interface SequencesUpdateGroupData {
  id: string
  requestBody: SequenceGroupUpdate
}

export type SequencesUpdateGroupResponse = SequenceGroupRead

export interface SequencesDeleteGroupData {
  id: string
}

export interface SequencesDeleteGroupResponse {
  message: string
}

export interface SequencesReadSequencesData {
  skip?: number
  limit?: number
  group_id?: string
  is_favorite?: boolean
}

export type SequencesReadSequencesResponse = Array<SequenceRead>

export interface SequencesCreateSequenceData {
  requestBody: SequenceCreate
}

export type SequencesCreateSequenceResponse = SequenceRead

export interface SequencesReadSequenceData {
  id: string
}

export type SequencesReadSequenceResponse = SequenceRead

export interface SequencesUpdateSequenceData {
  id: string
  requestBody: SequenceUpdate
}

export type SequencesUpdateSequenceResponse = SequenceRead

export interface SequencesDeleteSequenceData {
  id: string
}

export interface SequencesDeleteSequenceResponse {
  message: string
}

export interface SequencesReadItemsData {
  sequence_id: string
}

export type SequencesReadItemsResponse = Array<SequenceItemRead>

export interface SequencesCreateItemData {
  sequence_id: string
  requestBody: SequenceItemCreate
}

export type SequencesCreateItemResponse = SequenceItemRead

export interface SequencesUpdateItemData {
  sequence_id: string
  item_id: string
  requestBody: SequenceItemUpdate
}

export type SequencesUpdateItemResponse = SequenceItemRead

export interface SequencesDeleteItemData {
  sequence_id: string
  item_id: string
}

export interface SequencesDeleteItemResponse {
  message: string
}

export interface SequencesReorderItemsData {
  sequence_id: string
  requestBody: Array<{ id: string; position: number }>
}

export interface SequencesReorderItemsResponse {
  message: string
}
