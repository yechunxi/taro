import appLoader from './app'
import pageLoader from './page'

export default function transformRN (pageType, path) {
  console.log(pageType, path)
  // 入口文件 app.js
  if (pageType === 'app') {
    return appLoader(path)
  } else {
    return pageLoader(path)
  }
}
