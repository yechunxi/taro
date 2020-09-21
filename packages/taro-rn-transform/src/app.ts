import { readConfig, isEmptyObject } from '@tarojs/helper'
import { AppConfig } from '@tarojs/taro'
import { camelCase } from 'lodash'

function getPagesResource (config: AppConfig) {
  const importPages: string[] = []
  const screenNames: any[] = []
  const pages = config.pages || []
  if (!config.pages) return { screenNames, importPages }
  // 分包路由，也需要处理
  const subPackages = config.subPackages || []
  subPackages.forEach(item => {
    const subRoot = item.root.endsWith('/') ? item.root : `${item.root}/`
    const subPages = item.pages
    subPages.forEach(itm => {
      pages.push(subRoot + itm)
    })
  })
  pages.forEach(item => {
    const pagePath = item.startsWith('/') ? item : `/${item}`
    const screenName = camelCase(pagePath)
    const importScreen = `import ${screenName} from '.${pagePath}'`
    importPages.push(importScreen)
    screenNames.push(screenName)
  })

  return {
    screenNames: screenNames,
    importPages: importPages
  }
}

function getPageScreen (screen) {
  return `{name:'${screen}',component: ${screen}}`
}

function getAppConfig (appPath: string) {
  // 读取配置文件内容
  if (!appPath) {
    throw new Error('缺少 app 全局配置，请检查！')
  }
  const appConfig = readConfig(appPath)
  if (isEmptyObject(appConfig)) {
    throw new Error('缺少 app 全局配置，请检查！')
  }
  if (appConfig && (!appConfig.pages || !appConfig.pages.length)) {
    throw new Error('全局配置缺少 pages 字段，请检查！')
  }
  return appConfig as AppConfig
}

export default function generateAppEntry (appPath: string) {
  const appConfig = getAppConfig(appPath)
  const pages = getPagesResource(appConfig)
  const importPageList = pages.importPages.join(';')
  const routeList = pages.screenNames
  // 如果config ,有redux，再引入
  const importRedux = ''
  const store = {}
  // const store =  JSON.stringify({}) : 'configStore()'

  const code = `import { createRNApp } from '@tarojs/runtime-rn'
  import React,{ Component } from 'react'
  ${importPageList}
  ${importRedux}
  var config = ${JSON.stringify({ appConfig: appConfig })}
  config['pageList'] = [${routeList.map(screen => getPageScreen(screen))}]
  window.__taroAppConfig = config
  export default createRNApp(Component,config,${store})
  `
  return code
}
