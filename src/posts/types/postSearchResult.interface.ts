import { PostSearchBody } from './postSearchBody.interface'

export interface PostSearchResult {
  hits: {
    total: {
      value: number
    }
    hits: Array<{
      _source: PostSearchBody
    }>
  }
}
