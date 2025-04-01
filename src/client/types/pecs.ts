export type PecsTranslation = {
  language_code: string
  name: string
}

export type PecsCreate = {
  image_url: string
  is_custom: boolean
  name_custom?: string
  user_id?: string
  translations?: PecsTranslation[]
  category_ids?: string[]
}

export type PecsPublic = {
  id: string
  image_url: string
  is_custom: boolean
  name_custom?: string
  created_at: string
  user_id?: string
  translations: Array<{
    id: string
    language_code: string
    name: string
    pecs_id: string
  }>
}

export type PecsUpdate = {
  image_url?: string
  is_custom?: boolean
  name_custom?: string
  translations?: PecsTranslation[]
  category_ids?: string[]
}

export type PecsPublicList = {
  data: Array<PecsPublic>
  count: number
}

export type PecsReadPecsData = {
  limit?: number
  skip?: number
  language?: string
}

export type PecsReadPecsResponse = Array<PecsPublic>

export type PecsReadCustomPecsData = {
  limit?: number
  skip?: number
}

export type PecsReadCustomPecsResponse = Array<PecsPublic>

export type PecsCreatePecsData = {
  requestBody: PecsCreate
}

export type PecsCreatePecsResponse = PecsPublic

export type PecsReadPecsByIdData = {
  id: string
}

export type PecsReadPecsByIdResponse = PecsPublic

export type PecsUpdatePecsData = {
  pecsId: string
  requestBody: PecsUpdate
}

export type PecsUpdatePecsResponse = PecsPublic

export type PecsDeletePecsData = {
  pecsId: string
}

export type PecsDeletePecsResponse = { message: string }
