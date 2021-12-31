export interface BlogSchema {
  id: number
  content: string
  meta: unknown
}

export interface PostScheme {
  id: number
  content: string
  blogId: number
}
