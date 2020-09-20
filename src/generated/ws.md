# Data Models

## `WsCommand`

Union | Description
--- | ---
[`CreateBlog`](#CreateBlog) |
[`UpdateBlog`](#UpdateBlog) |

## `CreateBlog`

Field | Required | Type | Description
--- | --- | --- | ---
`type` | `true` | `"create blog"` |
`content` | `true` | `string` |

## `UpdateBlog`

Field | Required | Type | Description
--- | --- | --- | ---
`type` | `true` | `"update blog"` |
`id` | `true` | `number` |
`content` | `true` | `string` |

## `WsPush`

Union | Description
--- | ---
[`BlogChange`](#BlogChange) |

## `BlogChange`

Field | Required | Type | Description
--- | --- | --- | ---
`type` | `true` | `"blog change"` |
`id` | `true` | `number` |
`content` | `true` | `string` |
