import React from 'react'
import { PageConfig } from '@tarojs/taro'
import { PageProvider } from '@tarojs/router-rn'

export default function createRNPage (Page: any, pageConfig: PageConfig) {
  const WrapScreen = (Screen: any) => {
    return class PageScreen extends Screen {
      constructor (props: any) {
        super(props)
        this.state = {
          config: pageConfig
        }
      }

      onPullDownRefresh () {

      }

      render () {
        return React.createElement(PageProvider, { ...this.props },
          React.createElement(Screen, { ...this.props }, this.props.children))
      }
    }
  }

  return WrapScreen(Page)
}
