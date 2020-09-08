import { IBuildConfig } from './utils/types';
import Compile from './compiler';

export default async function build (appPath: string, config : IBuildConfig) {

  const compiler = new Compile({appPath,config});

  compiler.generateBabelConfig();





}
