import path from 'path'
import { IBuildConfig } from './utils/types';
import {
  resolveScriptPath,
  SOURCE_DIR,
  ENTRY,
  generateEnvList,
  generateConstantsList
} from '@tarojs/helper';
import { AppConfig } from '@tarojs/taro';


export default class Compiler{

  appPath : string
  config : IBuildConfig
  sourceDir : string
  entryFilePath: string
  entryFileName: string
  entryBaseName: string
  appConfig : AppConfig

  constructor(opts){
    this.config = opts.config;
    this.appPath = opts.appPath;

    const { sourceRoot = SOURCE_DIR  } = this.config

    this.sourceDir = path.join(this.appPath, sourceRoot)
    this.entryFilePath = resolveScriptPath(path.join(this.sourceDir,ENTRY));
    this.entryFileName = path.basename(this.entryFilePath);
    this.entryBaseName = path.basename(this.entryFilePath,path.extname(this.entryFileName));


  }

  init(){

  }

  generateBabelConfig(){

    const {
      defineConstants,
      env
    } = this.config;
    const constantsReplaceList = Object.assign(
      {
        'process.env.TARO_ENV': 'rn'
      },
      generateEnvList(env || {}),
      generateConstantsList(defineConstants || {})
    )
    console.log(constantsReplaceList);

  }


  generateMetroConfig(){


  }


  generateAppFile(){

    const appConfig = this.getAppConfig();

    this.getPages(appConfig);

  }


  getAppConfig() : AppConfig{
    // const appName = path.basename(this.)
    const appConfig = {}


    return appConfig as AppConfig
  }


  getPages(appConfig: AppConfig){


  }





}
