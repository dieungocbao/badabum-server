import { PostSearchBody } from './postSearchBody.interface'

export interface PostSearchResponse {
  hits: {
    total: number
    hits: Array<{
      _source: PostSearchBody
    }>
  }
}
