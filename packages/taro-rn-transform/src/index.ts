import appLoader from './app'
import pageLoader from './page'
import { TransformType } from './types/index'

module.exports.transform = function ({ src, filename, options }: TransformType) {
  if (options.entry) {
    return appLoader({ src, filename, options })
  } else {
    return pageLoader({ src })
  }
}
