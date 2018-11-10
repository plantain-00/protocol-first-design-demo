import * as cookie from 'cookie'

export function auth(cookieString: string | string[] | undefined) {
  if (cookieString) {
    const cookies = cookie.parse(cookieString as string)
    return cookies.foo
  }
  return ''
}
