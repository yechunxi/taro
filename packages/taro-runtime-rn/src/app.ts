import * as React from 'react'
import { createRouter } from '@tarojs/router-rn'
import { Provider as TCNProvider } from '@tarojs/components-rn'
import { Config } from '@tarojs/taro'
import { Current } from './current'

interface RNAppConfig {
  appConfig: Config,
  pageList: Array<Record<string, any>>
}

export function createRNApp (App: React.ComponentClass, config: RNAppConfig, store: any) {
  const appConfig = config.appConfig
  const routerConfig = {
    tabBar: appConfig.tabBar,
    pages: config.pageList,
    window: appConfig.window
  }
  const NewAppComponent = (AppCompoent) => {
    return class extends AppCompoent {
      render () {
        return React.createElement(TCNProvider, { store: store }, createRouter(routerConfig))
      }
    }
  }

  Current.app = NewAppComponent(App)
  return Current.app
}
