import * as cookie from 'cookie'
import { Request } from '.'

export function verify(cookieString: string | string[] | undefined) {
  if (cookieString) {
    const cookies = cookie.parse(cookieString as string)
    return cookies.foo
  }
  return ''
}

export function authorized(req: Request, _resourceName: string) {
  if (req.user === 'admin') {
    return
  }
  throw new Error('not permitted')
}
