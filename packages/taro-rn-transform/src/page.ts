import {
  readConfig
} from '@tarojs/helper'

export default function generateRNPage (pagePath: string) {
  const config = getPageConfig(pagePath)
  const componentPath = './index.source'
  const configString = JSON.stringify(config)

  const code = `import { createRNPage } from '@tarojs/runtime-rn'
import { readConfig } from '@tarojs/helper';
  import component from ${componentPath}
  var config = ${configString}
  export default  createRNPage(component,config)
  `
  return code
}

function getPageConfig (resourcePath: string) {
  if (!resourcePath) return
  const content = readConfig(resourcePath)
  return content
}
