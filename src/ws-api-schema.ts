/**
 * @entry ws-command.json
 */
export type WsCommand =
  | CreateBlog
  | UpdateBlog

export type WsPush =
  | BlogChange

/**
 * @public
 */
export interface CreateBlog {
  type: 'create blog'
  content: string
}

/**
 * @public
 */
export interface UpdateBlog {
  type: 'update blog'
  id: number
  content: string
}

/**
 * @public
 */
export interface BlogChange {
  type: 'blog change'
  id: number
  content: string
}
