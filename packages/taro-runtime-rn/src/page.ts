import * as React from 'react'
import { ScrollView, RefreshControl, AppState } from 'react-native'
import { PageConfig } from '@tarojs/taro'
import { PageProvider } from '@tarojs/router-rn'
// import { isFunction } from '@tarojs/shared'
import Taro from '@tarojs/taro-rn'
import { Current } from './current'

// function isClassComponent (component): boolean {
//   return isFunction(component.render) ||
//   !!component.prototype?.isReactComponent ||
//   component.prototype instanceof R.Component // compat for some others react-like library
// }

export function createPageConfig (Page: unknown, pageConfig: PageConfig) {
  // const isReactComponent = isClassComponent(Page)

  const WrapScreen = (Screen: any) => {
    return class PageScreen extends Screen {
      constructor (props: any) {
        super(props)
        this.state = {
          config: pageConfig,
          refreshing: false, // 刷新指示器
          appState: AppState.currentState
        }
        Current.page = this
        const { params = {} } = this.props.navigation
        Current.router = {
          params: params,
          path: ''
        }
        //
        this.screenRef = React.createRef()
        this.pageScrollView = React.createRef()
      }

      componentDidMount () {
        // 退到后台的触发对应的生命周期函数
        AppState.addEventListener('change', () => this.onAppStateChange)
      }

      componentWillUnmount () {
        AppState.removeEventListener('change', () => this.onAppStateChange)
      }

      onAppStateChange (nextAppState) {
        const { appState } = this.state
        if (appState.match(/inactive|background/) && nextAppState === 'active') {
          this.screenRef?.current?.componentDidShow()
        } else {
          this.screenRef?.current?.componentDidHide()
        }
        this.setState({ appState: nextAppState })
      }

      onPageScroll (e) {
        const { contentOffset } = e.nativeEvent
        const scrollTop = contentOffset.y
        try {
          this.screenRef.current.onPageScroll({ scrollTop })
        } catch (err) {
          throw new Error(err)
        }
      }

      onResize () {

      }

      // 监听的onMomentumScrollEnd
      onReachBottom (e) {
        const { onReachBottomDistance = 50 } = pageConfig
        const { layoutMeasurement, contentSize, contentOffset } = e.nativeEvent
        if (contentOffset?.y + layoutMeasurement?.height + onReachBottomDistance >= contentSize.height) {
          try {
            this.screenRef?.current?.onReachBottom()
          } catch (err) {
            throw new Error(err)
          }
        }
      }

      onPullDownRefresh () {
        this.setState({ refreshing: true })
        try {
          this.screenRef?.current?.onPullDownRefresh()
        } catch (e) {
          throw new Error(e)
        } finally {
          this.setState({ refreshing: false })
        }
      }

      refreshPullDown () {
        const { refreshing } = this.state
        return React.createElement(RefreshControl, {
          refreshing: refreshing,
          onRefresh: () => this.handlePullDownRefresh()
        }, null)
      }

      createPage () {
        return React.createElement(PageProvider, { Taro, pageConfig, ...this.props },
          React.createElement(Screen,
            { ...this.props, ref: this.screenRef },
            this.props.children))
      }

      render () {
        const { enablePullDownRefresh, disableScroll } = pageConfig
        return (disableScroll ? React.createElement(ScrollView,
          {
            style: { flex: 1 },
            contentContainerStyle: { minHeight: '100%' },
            ref: this.pageScrollView,
            scrollEventThrottle: 8,
            refreshControl: enablePullDownRefresh ? this.refreshPullDown() : null,
            onScroll: (e) => this.onPageScroll(e),
            onMomentumScrollEnd: (e) => this.onReachBottom(e)
          },
          this.createPage()) : this.createPage())
      }
    }
  }

  const pageIntance = WrapScreen(Page)
  Current.page = pageIntance

  return pageIntance
}
