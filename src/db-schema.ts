export interface BlogSchema {
  id: integer
  content: string
  meta: unknown
}

export interface PostSchema {
  id: integer
  content: string
  blogId: integer
}

type integer = number
