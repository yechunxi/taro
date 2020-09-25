import * as React from 'react'
import { camelCase } from 'lodash'
import { Image } from 'react-native'
import { isUrl } from './utils'
import { WindowConfig } from '@tarojs/taro'

const { NavigationContainer } = require('@react-navigation/native')
const { createStackNavigator } = require('@react-navigation/stack')
const { createBottomTabNavigator } = require('@react-navigation/bottom-tabs')

interface ITabBarItem {
  pagePath: string // 是 页面路径，必须在 pages 中先定义
  text: string // 是 tab 上按钮文字
  iconPath?: string // 否 图片路径
  selectedIconPath?: string // 否 选中时的图片路径
}
type HexColor = string

interface ITabBar {
  color: HexColor // 是  tab 上的文字默认颜色，仅支持十六进制颜色
  selectedColor: HexColor // 是  tab 上的文字选中时的颜色，仅支持十六进制颜色
  backgroundColor: HexColor // 是  tab 的背景色，仅支持十六进制颜色
  borderStyle?: 'black' | 'white' // 否 black tabbar 上边框的颜色， 仅支持 black / white
  list: ITabBarItem[] // 是 tab 的列表，详见 list 属性说明，最少 2 个、最多 5 个 tab
  position?: 'bottom' // 否 bottom tabBar 的位置，仅支持 bottom / top
  custom?: boolean // 否 false 自定义 tabBar，见详情
}

interface PageItem {
  name: string,
  component: unknown
}

interface RootConfig {
  pages: PageItem[],
  tabBar?: ITabBar,
  window?: WindowConfig
}

function getTabNames (config: RootConfig) {
  let tabNames: string[] = []
  const tabBar = config?.tabBar
  if (!tabBar) return tabNames
  tabNames = tabBar.list.map(item => {
    const pagePath = item.pagePath.startsWith('/') ? item.pagePath : `/${item.pagePath}`
    return camelCase(pagePath)
  })
  return tabNames
}

function getTabItemConfig (index: number, key: string) {
  const _taroTabBarIconConfig = {}
  return _taroTabBarIconConfig[index] && _taroTabBarIconConfig[index][key]
}

function getPageList (config: RootConfig) {
  // pageList 去除tabbar的页面
  const tabBar = config.tabBar
  const pageList = config.pages
  if (!tabBar) return pageList
  const tabNames = getTabNames(config)
  return pageList.filter(item => tabNames.indexOf(item.name) === -1)
}

function getTabItemOptions (item, index: number) {
  const selectIconPath = getTabItemConfig(index, 'itemPath') || item?.selectedIconPath
  const iconPath = getTabItemConfig(index, 'selectIconPath') || item?.iconPath
  return {
    tabBarLabel: getTabItemConfig(index, 'itemText') || item.text,
    tabBarBadge: getTabItemConfig(index, 'badgeText'),
    tabBarIcon: ({ focused }) => {
      const path = focused ? selectIconPath : iconPath
      if (!path) return null
      const source = isUrl(path) ? { uri: path } : { uri: path }
      const style = { width: 30, height: 30 }
      return React.createElement(Image, { style: style, source: source }, null)
    }
  }
}

// window配置的内容
function getStackOptions (config: RootConfig) {
  // navigationBarBackgroundColor
  const windowOptions = config.window || {}
  return {
    title: windowOptions.navigationBarTitleText || '',
    headerStyle: {
      backgroundColor: windowOptions.navigationBarBackgroundColor || '#ffffff'
    },
    headerTintColor: windowOptions.navigationBarTextStyle || 'black'
  }
}

function getTabItem (config: RootConfig, tabName: string) {
  const tabBar = config.tabBar
  const pageList = config.pages
  if (!tabBar) return pageList
  let tabItem: PageItem = {
    name: '',
    component: {}
  }
  pageList.forEach(item => {
    if (item.name === tabName) {
      tabItem = item
    }
  })
  return tabItem
}

function createTabStack (config: RootConfig, props: any) {
  const Tab = createBottomTabNavigator()
  const tabBar = config.tabBar
  const tabList: any = []

  tabBar?.list.forEach((item, index) => {
    const tabItemOptions = Object.assign({}, getTabItemOptions(item, index))
    const path = item.pagePath.startsWith('/') ? item.pagePath : `/${item.pagePath}`
    const tabName = camelCase(path)
    const tabPage: PageItem = getTabItem(config, tabName) as PageItem
    const tabNode = React.createElement(Tab.Screen, {
      key: `tab${tabName}`,
      name: `${tabPage.name}`,
      options: () => ({
        ...tabItemOptions,
        tabBarVisible: true
      }),
      component: tabPage.component,
      ...props
    })
    tabList.push(tabNode)
  })

  // tabbarOptions
  const tabBarOptions = {
    backBehavior: 'none',
    activeTintColor: tabBar?.selectedColor || '#3cc51f',
    inactiveTintColor: tabBar?.color || '#7A7E83',
    activeBackgroundColor: tabBar?.backgroundColor || '#ffffff',
    inactiveBackgroundColor: tabBar?.backgroundColor || '#ffffff',
    style: tabBar?.borderStyle ? {
      backgroundColor: tabBar.borderStyle
    } : {}
  }

  return React.createElement(Tab.Navigator, { tabOptions: tabBarOptions }, tabList)
}

function createTabNavigate (config: RootConfig) {
  const screeList: any = []
  const Stack = createStackNavigator()

  // 第一个页面是tabbar的
  const tabScreen = React.createElement(Stack.Screen,
    {
      key: 'tabscreen',
      name: 'tab'
    }, (props) => createTabStack(config, props))
  screeList.push(tabScreen)
  const pageList = getPageList(config)
  pageList.forEach(item => {
    const screenNode = React.createElement(Stack.Screen,
      {
        key: `${item.name}`,
        name: `${item.name}`,
        component: item.component
      }, null)
    screeList.push(screenNode)
  })

  return React.createElement(NavigationContainer, null,
    React.createElement(Stack.Navigator, { options: null }, screeList))
}

function createStackNavigate (config: RootConfig) {
  const Stack = createStackNavigator()
  const pageList = getPageList(config)
  if (pageList.length <= 0) return null
  const screenChild: any = []
  pageList.forEach(item => {
    const screenNode = React.createElement(Stack.Screen,
      {
        key: `${item.name}`,
        name: `${item.name}`,
        component: item.component
      }, null)
    screenChild.push(screenNode)
  })
  return React.createElement(NavigationContainer, {},
    React.createElement(Stack.Navigator,
      { options: getStackOptions(config) }, screenChild))
}

export function createRouter (config: RootConfig) {
  if (config.tabBar) {
    return createTabNavigate(config)
  } else {
    return createStackNavigate(config)
  }
}
