export type PictogramCreate = {
  word: string
  image_url: string
  is_custom?: boolean
  category_ids: string[]
}

export type PictogramPublic = {
  word: string
  image_url: string
  is_custom: boolean
  created_by: string
  category_ids: string[]
  id: string
}

export type PictogramUpdate = {
  word?: string
  image_url?: string
  is_custom?: boolean
  category_ids?: string[]
}

export type PictogramsPublic = {
  data: Array<PictogramPublic>
  count: number
}

export type PictogramsReadPictogramsData = {
  limit?: number
  skip?: number
  category_id?: string
}

export type PictogramsReadPictogramsResponse = PictogramsPublic

export type PictogramsCreatePictogramData = {
  requestBody: PictogramCreate
}

export type PictogramsCreatePictogramResponse = PictogramPublic

export type PictogramsReadPictogramData = {
  id: string
}

export type PictogramsReadPictogramResponse = PictogramPublic

export type PictogramsUpdatePictogramData = {
  id: string
  requestBody: PictogramUpdate
}

export type PictogramsUpdatePictogramResponse = PictogramPublic

export type PictogramsDeletePictogramData = {
  id: string
}

export type PictogramsDeletePictogramResponse = { message: string }
