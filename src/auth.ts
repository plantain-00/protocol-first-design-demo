import * as cookie from 'cookie'
import type { Request } from '.'

export function verify(cookieString: string | string[] | undefined) {
  if (cookieString) {
    const cookies = cookie.parse(cookieString as string)
    return cookies.foo
  }
  return ''
}

export async function authorized(req: Request, tags: string[]) {
  if (req.user === 'admin') {
    return
  }
  throw new HttpError('not permitted', 403)
}

export class HttpError extends Error {
  constructor(message: string, public statusCode = 500) {
    super(message)
  }
}
