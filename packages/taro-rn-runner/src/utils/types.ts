import { IProjectConfig } from '@tarojs/taro/types/compile'

export interface IBuildConfig extends IProjectConfig {
  isWatch: boolean,
  mode: 'production' | 'development'
}
