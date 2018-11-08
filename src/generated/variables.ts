/**
 * This file is generated by 'file2variable-cli'
 * It is not mean to be edited by hand
 */
// tslint:disable

export const srcGeneratedDataGql = `type Blog {
  id: Int!
  content: String!
  posts: [Post]!
}

type Post {
  id: Int!
  content: String!
}

type Query {
  blogs: BlogsResult!
  blog(id: Int!): BlogResult!
}

type Mutation {
  createBlog(content: String!): CreateBlogResult!
}

type BlogsResult {
  result: [Blog]!
}

type BlogResult {
  result: Blog
}

type CreateBlogResult {
  result: Blog!
}

type ResolveResult {
  blogs: BlogsResult!
  blog: BlogResult!
  createBlog: CreateBlogResult!
}
`
// tslint:enable
