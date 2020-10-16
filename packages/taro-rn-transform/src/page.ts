import {
  readConfig
} from '@tarojs/helper'
import { TransformPage } from './types/index'

export default function generatePage ({ src }: TransformPage) {
  const pagePath = src
  const config = getPageConfig(pagePath)
  const componentPath = './index.source'
  const configString = JSON.stringify(config)

  const code = `import { createPageConfig } from '@tarojs/runtime-rn'
import { readConfig } from '@tarojs/helper';

  import component from ${componentPath}
  var config = ${configString}
  export default  createPageConfig(component,config)
  `
  return code
}

function getPageConfig (resourcePath: string) {
  if (!resourcePath) return
  const content = readConfig(resourcePath)
  return content
}
