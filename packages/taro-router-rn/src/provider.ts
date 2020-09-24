import * as React from 'react'
import { camelCase } from 'lodash'
import { PageConfig } from '@tarojs/taro'
const queryString = require('query-string')

interface BaseOption {
  success?: Function
  fail?: Function
  complete?: Function
}

interface NavigateOption extends BaseOption {
  url: string
}

interface NavigateBackOption extends BaseOption {
  delta?: number
}

interface PageProps{
  children?: React.ReactNode
  Taro: any,
  navigation: any
  pageConfig?: PageConfig
}

type NavigateMethod = 'navigateTo' | 'redirectTo' | 'navigateBack' |'switchTab' | 'reLaunch'

interface NavigateBarTitleOption extends BaseOption{
  title: string
}
interface NavigateBarColorOption extends BaseOption{
  backgroundColor: string,
  fontColor: string
}

export class PageProvider extends React.Component<PageProps, any, any> {
  constructor (props: PageProps) {
    super(props)
    this.initPageAPI()
  }

  initPageAPI () {
    const { Taro } = this.props

    // 页面跳转相关函数
    Taro.navigateTo = this.navigateTo.bind(this)
    Taro.redirectTo = this.redirectTo.bind(this)
    Taro.navigateBack = this.navigateBack.bind(this)
    Taro.switchTab = this.switchTab.bind(this)
    Taro.reLaunch = this.reLaunch.bind(this)

    // tabBar相关 TODO
    Taro.showTabBar = this.showTabBar.bind(this)
    Taro.showTabBarRedDot = this.showTabBarRedDot.bind(this)
    Taro.hideTabBarRedDot = this.hideTabBarRedDot.bind(this)
    Taro.setTabBarBadge = this.setTabBarBadge.bind(this)
    Taro.removeTabBarBadge = this.removeTabBarBadge.bind(this)
    Taro.setTabBarItem = this.setTabBarItem.bind(this)

    // 页面配置相关
    Taro.setNavigationBarColor = this.setNavigateBarColor.bind(this)
    Taro.setNavigationBarTitle = this.setNavigateBarTitle.bind(this)
  }

  navigateTo (option: NavigateOption) {
    this.navigate(option, 'navigateTo')
  }

  redirectTo (option: NavigateOption) {
    this.navigate(option, 'redirectTo')
  }

  navigateBack (option: NavigateBackOption) {
    this.navigate(option, 'navigateBack')
  }

  switchTab (option: NavigateOption) {
    this.navigate(option, 'switchTab')
  }

  reLaunch (option: NavigateOption) {
    this.navigate(option, 'reLaunch')
  }

  // 处理url转换成pageName与params
  handleUrl (url: string) {
    const path = url.split('?')[0]
    const pageName = camelCase(path.startsWith('/') ? path : `/${path}`)
    const params = queryString.parseUrl(url.startsWith('/') ? url.substr(1) : url).query || {}
    return {
      pageName,
      params
    }
  }

  navigate (option: NavigateOption | NavigateBackOption, method: NavigateMethod) {
    const { success, complete, fail } = option
    let errMsg
    let routeParam
    const path = (option as NavigateOption).url
    if (path) {
      routeParam = this.handleUrl(path)
    }

    try {
      if (method === 'navigateTo') {
        this.props.navigation.push(routeParam.pageName, routeParam.params)
      } else if (method === 'redirectTo') {
        this.props.navigation.replace(routeParam.pageName, routeParam.params)
      } else if (method === 'switchTab') {
        this.props.navigation.navigate(routeParam.pageName, routeParam.params)
      } else if (method === 'navigateBack') {
        const number = (option as NavigateBackOption).delta ? (option as NavigateBackOption).delta : 1
        this.props.navigation.pop({ count: number })
      } else if (method === 'reLaunch') {
        this.props.navigation.popToTop()
        this.props.navigation.replace(routeParam.pageName, routeParam.params)
      }
    } catch (error) {
      errMsg = error
    }

    return new Promise((resolve, reject) => {
      if (errMsg) {
        fail && fail(errMsg)
        complete && complete(errMsg)
        reject(errMsg)
      } else {
        const msg = `${method}:ok`
        success && success(msg)
        complete && complete(msg)
        resolve()
      }
    })
  }

  // showTabbar
  showTabBar () {

  }

  showTabBarRedDot () {}

  hideTabBarRedDot () {}

  removeTabBarBadge () {}

  setTabBarBadge () {}

  setTabBarItem () {}

  setNavigateBarTitle (option: NavigateBarTitleOption) {
    const { title, fail, success, complete } = option
    let errMsg
    try {
      this.props.navigation.setOptions({
        title: title
      })
    } catch (error) {
      errMsg = error
    }
    return new Promise((resolve, reject) => {
      if (errMsg) {
        fail && fail(errMsg)
        complete && complete(errMsg)
        reject(errMsg)
      } else {
        const msg = 'setNavigateBarTitle:ok'
        success && success(msg)
        complete && complete(msg)
        resolve()
      }
    })
  }

  setNavigateBarColor (option: NavigateBarColorOption) {
    const { backgroundColor, fontColor, fail, success, complete } = option
    let errMsg
    try {
      this.props.navigation.setOptions({
        headerStyle: {
          backgroundColor: backgroundColor
        },
        headerTintColor: fontColor
      })
    } catch (error) {
      errMsg = error
    }
    return new Promise((resolve, reject) => {
      if (errMsg) {
        fail && fail(errMsg)
        complete && complete(errMsg)
        reject(errMsg)
      } else {
        const msg = 'setNavigateBarColor:ok'
        success && success(msg)
        complete && complete(msg)
        resolve()
      }
    })
  }

  render () {
    return this.props.children
  }
}
