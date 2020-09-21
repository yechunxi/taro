import { PageInstance } from './instance'

interface Router {
  params: Record<string, unknown>,
  path: string
}

interface Current {
  app: any | null,
  router: Router | null,
  page: PageInstance | null
}

export const Current: Current = {
  app: null,
  router: null,
  page: null
}

export const getCurrentInstance = () => Current
