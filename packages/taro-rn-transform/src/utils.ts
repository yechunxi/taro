import * as path from 'path'
import { readConfig, resolveMainFilePath } from '@tarojs/helper'

function getConfigFilePath (filePath: string) {
  return resolveMainFilePath(`${filePath.replace(path.extname(filePath), '')}.config`)
}

export function getConfigContent (path: string) {
  if (!path) return {}
  const fileConfigPath = getConfigFilePath(path)
  const content = readConfig(fileConfigPath)
  return content
}
