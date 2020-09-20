# graphql-demo

[![Dependency Status](https://david-dm.org/plantain-00/graphql-demo.svg)](https://david-dm.org/plantain-00/graphql-demo)
[![devDependency Status](https://david-dm.org/plantain-00/graphql-demo/dev-status.svg)](https://david-dm.org/plantain-00/graphql-demo#info=devDependencies)
[![Build Status: Linux](https://travis-ci.org/plantain-00/graphql-demo.svg?branch=master)](https://travis-ci.org/plantain-00/graphql-demo)
[![Build Status: Windows](https://ci.appveyor.com/api/projects/status/github/plantain-00/graphql-demo?branch=master&svg=true)](https://ci.appveyor.com/project/plantain-00/graphql-demo/branch/master)
![Github CI](https://github.com/plantain-00/graphql-demo/workflows/Github%20CI/badge.svg)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fplantain-00%2Fgraphql-demo%2Fmaster%2Fpackage.json)](https://github.com/plantain-00/graphql-demo)

## design document

### 需求分析

对于不同前后端之间的 API 调用，例如 RESTful API，因为不是直接调用，默认没有对请求、响应的数据等进行限制，结果容易出错，而且相关数据结构的定义等要在前端、后端、API 等各个地方多次定义，导致重复定义，或定义不一致。

### 设计目标

1. API 协议优先，相关数据只需要相对集中地、相对方便地定义一次，其它信息由此派生或生成出来
2. API 的实现方和调用方的类型尽可能明确
3. 适量使用 typescript 的类型操作，在维护复杂和使用方便两个方面取平衡
4. 对于 typescript 类型操作难实现的部分，使用类型代码生成
5. 尽量只生成类型代码，不生成实现代码，以免代码生成脚本过于复杂、难以维护、耗时太长，也避免和具体前端请求库（fetch、axios）、具体后端框架（express、koa、nestjs）的耦合，这样更具通用性
6. 尽可能方便自动测试

### API 协议和相应的 swagger

一般有下面几个方案：

1. 直接写 swagger 文件：信息密度较低
2. 通过 decorator 把信息标注在实际代码上，并由此生成 swagger 文件：依赖了具体实现的框架，另外需要 parse 所有相关代码，甚至启动整个 backend，代码量大时，耗时大
3. 通过函数声明、类型定义，并由此生成 swagger 文件：信息密度较高，也不依赖具体实现的框架，定义的类型还能被复用

```ts
/**
 * @method get
 * @path /api/blogs/{id}
 * @tags blog
 */
declare function getBlogById(
  /**
   * @in path
   */
  id: number,
  /**
   * @in query
   */
  ignoredFields?: BlogIgnorableField[],
): Promise<{ result?: Blog }>

export type BlogIgnorableField = 'posts' | 'meta'

type integer = number

export interface Blog {
  id: integer
  content: string
  posts: Post[]
  meta: unknown
}
```

例如上面就是第 3 种方案的一部分定义，实际例子里这样的类型定义占用里 122 行 [src/restful-api-schema.ts](./src/restful-api-schema.ts)，生成的 swagger 文件则有 282 行 [static/swagger.json](./static/swagger.json)，信息密度提高了一倍左右。

### 按需读取字段的实现方式

graphql 的一个特点是，用户可以控制需要返回哪些字段，而 RESTful API 一般默认不会实现这个。

这个功能要解决的问题是，少数字段体积太大，或需要额外的查询，例如文章内容、populate 到的其它实体数据，导致全部返回时产生性能问题。

为了优化性能，需要忽略掉对不需要的复杂字段的查询。

所以这里的实现，不像 graphql 那样需要列出所有需要的字段，而是默认返回所有字段，根据参数中的 ignoredFields，把不需要的字段排除掉。

这种方式维护起来也更方便一点，例如需要增加一个不复杂的字段，对 graphql，则所有用到的地方都要加上这个字段，而这种方式则不需要做任何修改；如果需要增加一个复杂字段，这种方式不修改任何代码就能保持兼容性，而且也有把复杂字段加入 ignoredFields 来提高性能的后续手段。

### 前端使用

根据之前定义的元数据，为前端生成下面这样通用的类型 [生成脚本 generate-restful-api-declaration.ts](./generate-restful-api-declaration.ts) [生成的类型 src/restful-api-declaration.ts](./src/restful-api-declaration.ts)：

```ts
export type RequestRestfulAPI = {
  <T extends BlogIgnorableField = never>(method: 'GET', url: '/api/blogs', args?: { query?: { skip?: number, take?: number, content?: string, sortField?: "id" | "content", sortType?: "asc" | "desc", ignoredFields?: T[] } }): Promise<{ result: Omit<Blog, T>[], count: number }>
  <T extends BlogIgnorableField = never>(method: 'GET', url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: T[] } }): Promise<{ result?: Omit<Blog, T> }>
  <T extends BlogIgnorableField = never>(method: 'POST', url: '/api/blogs', args: { query?: { ignoredFields?: T[] }, body: { content: string } }): Promise<{ result: Omit<Blog, T> }>
  <T extends BlogIgnorableField = never>(method: 'PATCH', url: '/api/blogs/{id}', args: { path: { id: number }, query?: { ignoredFields?: T[] }, body?: { content?: string, meta?: unknown } }): Promise<{ result: Omit<Blog, T> }>
  (method: 'DELETE', url: '/api/blogs/{id}', args: { path: { id: number } }): Promise<{  }>
}
```

然后根据前端使用的请求库，定义一个请求函数。下面以 fetch 为例 [static/index.ts](./static/index.ts)：

```ts
const requestRestfulAPI: RequestRestfulAPI = async (
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  args?: { path?: { [key: string]: string | number }, query?: {}, body?: {} }
) => {
  if (args) {
    if (args.path) {
      for (const key in args.path) {
        url = url.replace(`{${key}}`, args.path[key].toString())
      }
    }
    if (args.query) {
      url += '?' + qs.stringify(args.query)
    }
  }
  const result = await fetch(
    url,
    {
      method,
      body: args?.body ? JSON.stringify(args.body) : undefined,
      headers: args?.body ? { 'content-type': 'application/json' } : undefined
    })
  return result.json()
}
```

使用 `requestRestfulAPI` 时，会自动根据参数匹配对应 API 生成的函数声明，以保证和对应 API 的请求、响应的数据结构一致。

另外，因为用到了范型，可以根据 `ignoredFields` 的实际值确定范型参数 T 的类型，从而在响应数据结构中把忽略掉的字段 Omit 掉。

这样，也就达到的设计目标里，调用方的类型完全明确的目标。

### json schema 验证输入

如果用户绕过前端类型验证，或自定义请求，后端就有必要对数据格式进行验证了。

这里根据之前定义的元数据，生成 json schema，然后用 json schema 来验证输入，json schema 作为一个验证标准，使用时不依赖具体的验证库，更具通用性。

这里有一些特殊处理，例如 query 和 path 中的数值、boolean 实际是字符串的形式，直接严格验证会导致错误的验证错误。对于这个问题，ajv 支持通过 coerceTypes 选项来处理这些特殊情况。

另外，ajv 的 useDefaults 选项可以在验证后，使用 json schema 里定义的 default 值，这对类型也会产生影响，例如，`take` 参数在前端的类型是 `take?: number`，前端可以选择不提供，但在后端的类型则是 `take: number`，即使用户不填，ajv 也会自动填入默认值，后端取到的 `take` 参数总是有值的，使用时也更加方便。

### 后端类型

```ts
export type GetBlogs = <T extends BlogIgnorableField = never>(req: { query: { skip: number, take: number, content?: string, sortField: "id" | "content", sortType: "asc" | "desc", ignoredFields?: T[] } }) => Promise<{ result: Omit<Blog, T>[], count: number }>
export type GetBlogById = <T extends BlogIgnorableField = never>(req: { path: { id: number }, query?: { ignoredFields?: T[] } }) => Promise<{ result?: Omit<Blog, T> }>
export type CreateBlog = <T extends BlogIgnorableField = never>(req: { query?: { ignoredFields?: T[] }, body: { content: string } }) => Promise<{ result: Omit<Blog, T> }>
export type PatchBlog = <T extends BlogIgnorableField = never>(req: { path: { id: number }, query?: { ignoredFields?: T[] }, body?: { content?: string, meta?: unknown } }) => Promise<{ result: Omit<Blog, T> }>
export type DeleteBlog = (req: { path: { id: number } }) => Promise<{  }>
```

后端也像前端那样生成了类型，其中参数就是请求参数通过了 json schema 验证后的数据，返回值直接在 body 中以 JSON 的形式返回，异常情况以 throw 的形式实现。

这样不管后端使用什么框架，只要有函数，或者类里的方法实现了这些类型，也就正确处理了 API 的输入和输出。

### 以 expressjs 为例为 API 实现注册路由

因为之前定义的元数据里有 url 和 method 等信息，可以用来自动生成简单的路由注册功能，例如：

```ts
export const registerGetBlogs = (app: express.Application, handler: GetBlogs) => handleHttpRequest(app, 'get', '/api/blogs', 'blog', getBlogsValidate, handler)
export const registerGetBlogById = (app: express.Application, handler: GetBlogById) => handleHttpRequest(app, 'get', '/api/blogs/:id', 'blog', getBlogByIdValidate, handler)
export const registerCreateBlog = (app: express.Application, handler: CreateBlog) => handleHttpRequest(app, 'post', '/api/blogs', 'blog', createBlogValidate, handler)
export const registerPatchBlog = (app: express.Application, handler: PatchBlog) => handleHttpRequest(app, 'patch', '/api/blogs/:id', 'blog', patchBlogValidate, handler)
export const registerDeleteBlog = (app: express.Application, handler: DeleteBlog) => handleHttpRequest(app, 'delete', '/api/blogs/:id', 'blog', deleteBlogValidate, handler)
```

使用使用时直接绑定 API 的实现函数即可 [src/restful-api.ts](./src/restful-api.ts)：

```ts
registerGetBlogs(app, getBlogs)
registerGetBlogById(app, getBlogById)
registerCreateBlog(app, createBlog)
registerPatchBlog(app, patchBlog)
registerDeleteBlog(app, deleteBlog)
```

### 添加新 API 时的流程

1. 在 [src/restful-api-schema.ts](./src/restful-api-schema.ts) 定义新 API 的参数、返回值、url、method 等信息
2. 执行 `yarn schema`
3. 检查生成的 swagger 是否符合预期，如果有遗漏的信息，返回执行第 1、2 步
4. 后端增加注册代码，例如 `registerDeleteBlog(app, deleteBlog)`，其中 `registerDeleteBlog` 已经自动生成，`deleteBlog` 需要自行实现，参数和返回值已经生成好了
5. 前端调用新接口，例如 `const deleteBlogResult = await requestRestfulAPI('DELETE', '/api/blogs/{id}', { path: { id: 1 } })`
6. 整体测试一下，添加单元测试

### 最后验证一下设计目标是否满足

1. API 协议优先，相关数据只需要相对集中地、相对方便地定义一次，其它信息由此派生或生成出来：✅ swagger、前端类型、后端类型、json schema、注册路由都是由此派生或生成出来的
2. API 的实现方和调用方的类型尽可能明确：✅ 没有 any，能枚举的地方都枚举了，连 `ignoredFields` 的值都能和返回的字段对应起来
3. 适量使用 typescript 的类型操作，在维护复杂和使用方便两个方面取平衡：✅ 每个 API 各生成 1 行前端类型代码、后端类型代码、注册路由代码
4. 对于 typescript 类型操作难实现的部分，使用类型代码生成：✅ 前端类型、后端类型、注册路由都是生成的代码
5. 尽量只生成类型代码，不生成实现代码，以免代码生成脚本过于复杂、难以维护、耗时太长，也避免和具体前端请求库（fetch、axios）、具体后端框架（express、koa、nestjs）的耦合，这样更具通用性：✅ 生成脚本只有不到 200 行代码，所有 schema 的生成只需要 3 秒左右，前后端的类型都是足够抽象的，与使用的框架、数据库等都无关，只专注解决 API 相关的重复性劳动
6. 尽可能方便自动测试：✅ 由上面的流程可知，业务逻辑可能出问题的地方，主要在后端类型的实现代码，对这些函数的自动测试可以使用单元测试来进行，这样不需要启动整个后端，比全部使用集成测试，测试耗时要显著短，占用资源要显著少 [spec/restful-api.ts](./spec/restful-api.ts)

### websocket

对于推送相关的需求，一般使用 websocket，websocket 的模式不是请求-响应模式，只是双向的数据传输，所以只要保证发送和接收的数据的类型一样，就可以保证两边的数据使用方式一致。

```ts
export type WsCommand =
  | CreateBlog
  | UpdateBlog

export interface CreateBlog {
  type: 'create blog'
  content: string
}

export interface UpdateBlog {
  type: 'update blog'
  id: number
  content: string
}
```

上面是一部分类型定义 [src/ws-api-schema.ts](./src/ws-api-schema.ts)，这里使用 tagged union 的方式，这样接收到数据时按 tag 过滤，ts 可以正确定位到相应的类型。

关于 websocket api 的文档，目前没有统一的标准，这里会生成 markdown 文档：[src/generated/ws.md](./src/generated/ws.md)

### 通过 json schema 验证通过 ws 接收的数据

根据上面定义的类型元数据，可以生成 json schema [src/generated/ws-command.json](./src/generated/ws-command.json)，然后用来验证接收的数据 [src/ws-api.ts](./src/ws-api.ts)。

```ts
const ajv = new Ajv()
const validateWsCommand = ajv.compile(srcGeneratedWsCommandJson)

ws.on('message', (data) => {
  const input: WsCommand = JSON.parse(data)
  const valid = validateWsCommand(input)
})
```

### 通过 ws 传输二进制数据

传输二进制数据时，传输的数据量比传输 json 要显著小。

以 protobuf 为例，根据上面定义的类型元数据，可以生成 protobuf 类型定义文件 [src/generated/ws.proto](./src/generated/ws.proto)，发送和接收时可以用它来 encode/decode [src/ws-api.ts](./src/ws-api.ts)：

```ts
const root = protobuf.Root.fromJSON(srcGeneratedWsProto)
const commandType = root.lookup('WsCommand') as protobuf.Type
const pushType = root.lookup('WsPush') as protobuf.Type

function sendWsPush(wsPush: WsPush, binary?: boolean) {
  if (binary) {
    ws.send(pushType.encode(wsPush).finish())
  } else {
    ws.send(JSON.stringify(wsPush))
  }
}

ws.on('message', (data) => {
  if (typeof data === 'string') {
    const input: WsCommand = JSON.parse(data)
    const valid = validateWsCommand(input)
  } else if (Buffer.isBuffer(data)) {
    const input = commandType.toObject(commandType.decode(data)) as WsCommand
  }
})
```

这样从使用角度，通过 ws 传输 json 或 protobuf 的区别只有一个 `sendWsPush` 的 `binary` 参数的区别。

### 为通过 ws 传输的数据添加新数据类型时的流程

1. 在 [src/ws-api-schema.ts](./src/ws-api-schema.ts) 定义新的类型，根据 `type` 来区分类型，并 union 到 `WsCommand` 或 `WsPush` 上
2. 执行 `yarn schema`，检查生成的 markdown 是否符合预期，如果有遗漏的信息，返回执行上一步
3. 发送时调用 `sendWsCommand` 或 `sendWsPush`
4. 接收时对 `input` 按 `type` 过滤

## install

```bash
git clone https://github.com/plantain-00/graphql-demo-release.git . --depth=1 && yarn add --production
```

set `foo=admin` in browser cookie.

## docker

```bash
docker run -d -p 6767:6767 plantain-00/graphql-demo
```
