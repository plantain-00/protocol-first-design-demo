import * as cookie from 'cookie'
import * as express from 'express'
import { Request } from '.'

export function verify(cookieString: string | string[] | undefined) {
  if (cookieString) {
    const cookies = cookie.parse(cookieString as string)
    return cookies.foo
  }
  return ''
}

export async function authorized(req: Request, _resourceName: string, res?: express.Response) {
  if (req.user === 'admin') {
    return
  }
  if (res) {
    res.status(403).end()
  } else {
    throw new Error('not permitted')
  }
}
