import * as React from 'react'
import { PageConfig } from '@tarojs/taro'
import { PageProvider } from '@tarojs/router-rn'
import Taro from '@tarojs/taro-rn'
import { Current } from './current'

export function createRNPage (Page: any, pageConfig: PageConfig) {
  const WrapScreen = (Screen: any) => {
    return class PageScreen extends Screen {
      constructor (props: any) {
        super(props)
        this.state = {
          config: pageConfig
        }
        Current.page = this
        const { params = {} } = this.props.navigation
        Current.router = {
          params: params,
          path: ''
        }
      }

      onPullDownRefresh () {

      }

      onPageScroll () {

      }

      onReachBottom () {

      }

      render () {
        return React.createElement(PageProvider, { Taro, pageConfig, ...this.props },
          React.createElement(Screen, { ...this.props }, this.props.children))
      }
    }
  }

  return WrapScreen(Page)
}
