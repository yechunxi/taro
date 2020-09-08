// import * as path from 'path'
// import { merge, get } from 'lodash'
import { IPluginContext } from '@tarojs/service'
import rnRunner from '@tarojs/rn-runner'

export default (ctx: IPluginContext) => {
  ctx.registerPlatform({
    name: 'rn',
    useConfigName: 'rn',
    async fn ({ config }) {
      const { appPath} = ctx.paths
      // const { npm } = ctx.helper
      // const { initialConfig, ENTRY } = ctx
      // const entryFileName = `${ENTRY}.config`
      // const entryFile = path.basename(entryFileName)
      // const defaultEntry = {
      //   [ENTRY]: [path.join(sourcePath, entryFile)]
      // }
      // const customEntry = get(initialConfig, 'rn.entry')
      // 准备 rnRunner 参数
      const rnRunnerOpts = {
        ...config,
        buildAdapter: config.platform,
      }
      // rnRunnerOpts.entry = merge(defaultEntry, customEntry)
      // const rnRunner = await npm.getNpmPkg('@tarojs/rn-runner', appPath);
      await rnRunner(appPath, rnRunnerOpts)
    }
  })
}
