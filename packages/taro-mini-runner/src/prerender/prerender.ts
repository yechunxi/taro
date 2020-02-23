import { Shortcuts, noop, isString, isObject, isFunction } from '@tarojs/shared'
import { MINI_APP_FILES } from '@tarojs/runner-utils'

import { NodeVM } from 'vm2'
import { omitBy } from 'lodash'
import * as webpack from 'webpack'
import * as fs from 'fs'
import { join } from 'path'
import { IBuildConfig } from '../utils/types'
import { Adapter } from '../template/adapters'
import { printPrerenderSuccess, printPrerenderFail } from '../utils/logHelper'
import { buildAttribute, Attributes } from '../template'

const { JSDOM } = require('jsdom')
const wx = require('miniprogram-simulate/src/api')
const micromatch = require('micromatch')

interface MiniData {
  [Shortcuts.Childnodes]?: MiniData[]
  [Shortcuts.NodeName]: string
  [Shortcuts.Class]?: string
  [Shortcuts.Style]?: string
  [Shortcuts.Text]?: string
  uid: string
}

interface PageConfig {
  path: string
  params: Record<string, unknown>
}

export interface PrerenderConfig {
  match?: string | string[]
  include?: Array<string | PageConfig>
  exclude?: string[]
  mock?: Record<string, unknown>
  console?: boolean
  transformData?: (data: MiniData, config: PageConfig) => MiniData
  transformXML?: (data: MiniData, config: PageConfig, xml: string) => MiniData
}

export function validatePrerenderPages (pages: string[], config?: PrerenderConfig) {
  let pageConfigs: PageConfig[] = []

  if (config == null) {
    return pageConfigs
  }

  const { include = [], exclude = [], match } = config

  if (match) {
    pageConfigs = micromatch(pages, match).map((p: string) => ({ path: p, params: {} }))
  }

  for (const page of pages) {
    for (const i of include) {
      if (isString(i) && i === page) {
        pageConfigs.push({
          path: page,
          params: {}
        })
      }

      if (isObject<PageConfig>(i) && i.path === page) {
        pageConfigs.push({
          ...{
            params: {}
          },
          ...i
        })
      }
    }
  }

  pageConfigs = pageConfigs.filter(p => !exclude.includes(p.path))

  return pageConfigs
}

export class Prerender {
  private buildConfig: IBuildConfig
  private globalObject: string
  private outputPath: string
  private prerenderConfig: PrerenderConfig
  private stat: webpack.Stats.ToJsonOutput
  private vm: NodeVM
  private appLoaded = false

  public constructor (buildConfig: IBuildConfig, webpackConfig: webpack.Configuration, stat: webpack.Stats) {
    this.buildConfig = buildConfig
    this.outputPath = webpackConfig.output!.path!
    this.globalObject = webpackConfig.output!.globalObject!
    this.prerenderConfig = buildConfig.prerender!
    this.stat = stat.toJson()
    this.vm = new NodeVM({
      console: this.prerenderConfig.console ? 'inherit' : 'off',
      require: {
        external: true,
        context: 'sandbox'
      },
      sandbox: this.buildSandbox()
    })
  }

  public async render (): Promise<void> {
    const pages = validatePrerenderPages(Object.keys(this.stat.entrypoints!), this.prerenderConfig)

    if (!this.prerenderConfig.console && !this.appLoaded) {
      process.on('unhandledRejection', noop);
    }

    await this.writeScript('app')

    if (!this.appLoaded) {
      this.vm.run(`
        const app = require('${this.getRealPath('app')}')
        app.onLaunch()
      `, this.outputPath)
      this.appLoaded = true
      await Promise.resolve()
    }

    await Promise.all(pages.map(p => this.writeScript(p.path)))

    for (const page of pages) {
      try {
        await this.writeXML(page)
        printPrerenderSuccess(page.path)
      } catch (error) {
        printPrerenderFail(page.path)
        console.error(error)
      }
    }
  }

  private getRealPath (path: string, ext = '.js') {
    return join(this.outputPath, path + ext)
  }

  private buildSandbox () {
    const Page = (config: unknown) => config
    const App = (config: unknown) => config
    const dom = new JSDOM()
    const mock = this.prerenderConfig.mock
    return {
      ...dom,
      Page,
      App,
      [this.globalObject]: wx,
      getCurrentPages: noop,
      getApp: noop,
      requirePlugin: noop,
      PRERENDER: true,
      ...mock
    }
  }

  private renderToXML = (data: MiniData) => {
    const nodeName = data[Shortcuts.NodeName]

    if (nodeName === '#text') {
      return data[Shortcuts.Text]
    }

    if (data['disablePrerender' ]|| data['disable-prerender']) {
      return ''
    }

    const style = data[Shortcuts.Style]
    const klass = data[Shortcuts.Class]
    const children = data[Shortcuts.Childnodes] ?? []

    const attrs = omitBy(data, (_, key) => {
      const internal = [Shortcuts.NodeName, Shortcuts.Childnodes, Shortcuts.Class, Shortcuts.Style, Shortcuts.Text, 'uid']
      return internal.includes(key) || key.startsWith('data-')
    })

    return `<${nodeName}${style ? ` style="${style}"` : ''}${klass ? ` class="${klass}"` : ''} ${buildAttribute(attrs as Attributes, nodeName)}>${children.map(this.renderToXML).join('')}</${nodeName}>`
  }

  private async writeXML (config: PageConfig): Promise<void> {
    const { path } = config

    let data = await this.renderToData(config)
    if (isFunction(this.prerenderConfig.transformData)) {
      data = this.prerenderConfig.transformData(data, config)
    }

    let xml = this.renderToXML(data)
    if (isFunction(this.prerenderConfig.transformXML)) {
      xml = this.prerenderConfig.transformXML(data, config, xml)
    }

    const templatePath = this.getRealPath(path, MINI_APP_FILES[this.buildConfig.buildAdapter].TEMPL)
    const [importTemplate, template] = fs.readFileSync(templatePath, 'utf-8').split('\n')

    let str = `${importTemplate}\n`
    str += `<block ${Adapter.if}="{{root.uid}}">\n`
    str += `  ${template}\n`
    str += '</block>\n'
    str += `<block ${Adapter.else}>\n`
    str += `${xml}\n`
    str += '</block>'
    fs.writeFileSync(templatePath, str, 'utf-8')
  }

  private writeScript (path: string): Promise<void> {
    path = this.getRealPath(path)
    return new Promise((resolve) => {
      const s = `
      if (typeof PRERENDER !== 'undefiend') {
        module.exports = global._prerender
      }`
      fs.appendFile(path, s, 'utf8', () => {
        resolve()
      })
    })
  }

  private renderToData ({ path, params }: PageConfig): Promise<MiniData> {
    return new Promise((resolve, reject) => {
      const dataReceiver = this.vm.run(`
        const page = require('${this.getRealPath(path)}')
        page.route = '${path}'
        module.exports = function (cb) {
          page.onLoad(${JSON.stringify(params || {})}, cb)
        }
      `, this.outputPath)

      dataReceiver((data) => {
        const domTree = data['root.cn.[0]'] || data['root.cn[0]']
        if (domTree == null) {
          reject(new Error('初始化渲染没有任何数据。'))
        }
        resolve(domTree)
      })
    })
  }
}