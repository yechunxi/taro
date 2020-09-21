import * as fs from 'fs-extra'
import * as path from 'path'
import { IBuildConfig } from './utils/types'
import Compile from './compiler'

import transformRN from '@tarojs/rn-transform'

export default async function build (appPath: string, config: IBuildConfig) {
  const compiler = new Compile({ appPath, config })

  // const appConfig: AppConfig = {
  //   pages: [
  //     'pages/index/index',
  //     'pages/tabbar/home',
  //     'pages/tabbar/news',
  //     'pages/tabbar/my',
  //     'pages/index/detail'
  //   ],
  //   tabBar: {
  //     backgroundColor: '#ffffff',
  //     color: '#999',
  //     selectedColor: '#ff552e',
  //     list: [{
  //       pagePath: 'pages/tabbar/home',
  //       text: '首页',
  //       iconPath: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4BAMAAADLSivhAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAwUExURSfEk0dwTDXHmiTJlC3Ek0XZpy7EmCPJkyTKkyPJkyLKkyLJkiPJkyLHlyXJkyPJk4Ql1qYAAAAPdFJOUxoACFsUAw+dOrHz2OgliWeThXUAAAJpSURBVHja7dmxbhNBEAbgH3O2QhEEpzO1LQVqaqq7KA/go6A2SOQVXNCkRSmgpEEpeACXpMsjkJaON6AlgNgsxNFkxc3N7fxIbpgmsuRPuzcb7+3M4r4WTw8PaqA4OHyofkXB5R4gsd9m4OkjII0X7VBc1vgrivkwLMOmgw/Be1Bi38ZibQ3F6lrHz9AbL/twCSPmOp7WFi5aFc9gxkjDDzAgnidYmbQ58RQvMCjGCdYybWccerbsnEEf2B4a+sD20JCB84eGkmo74YKnyIo2wVUebhK8zMMTwZKuzJRB0pWXMsF1Li4El4Br3pBZ588bkuv8fMM3a2C+wZUHNxs88+DRBtceXFzhEnA+NOSR8x8aySO/Xofe+P4ueWgkq3wWjPiRrHTE8nknmHEk347yZr5u2/gxJGMRV17cRLzw4nHEMy8eRbz04knE8OJIp37covTjOSo/bnDPj29xeOHHY8z8eISlH084XPtx8e/xxWq1ehV3rFWMdQgf45+TTowO/A3AnRB+IsanEN4CeNOB8R9nYmqptvcftr1fFbUZUNvQ9nZPatOnXjfUi455xVIvd+pYQR1oqKMUdYhjjo/UwZU/MledG+n6Buncb5ueMuFY8KlSJugFyu7Jtb041woUvTS6e42/6KWRXpQ9ubIflPqkvxzcOfuzOEdKZWQUop9/4/dKIWqWwF9D+GWUwOq842LHJVZmbZf9x6dm2a/Pe/dcmzXV6mCaLFR7h2osMS0tqpnGtPGoBiLTuqSapky7lmoUMy1qsjnOt+X5CwH+KoK/BBFtW/7ih79y4i+7+Gs24YMu+KirxUusv9U4ParTFQAAAABJRU5ErkJggg=='
  //     }, {
  //       pagePath: 'pages/tabbar/news',
  //       text: '消息',
  //       iconPath: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAB4CAMAAAAOusbgAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABCUExURSfEkyLJkyLJkyXGlS3Eky7EmCvGl0dwTDnWoTbClyPJkyPJkyTJlSPJkyTIkyLJkyLJkyPIkyPJkyLJliXIlCPJk17fq/0AAAAVdFJOUxrq2CkUDxcABAn1hjXAT6mWZnUfQbWwKDIAAANdSURBVHjaxZvbcqwgEEW3Ci2N93H4/189VqpOiImBJvYM63FeVkFvHIUGfTGOrTWGCAdExljLri8GhU5DuIRMoR0lAyUkIctOXcwGIgxrip1FAdaJxfLB6g0butqovil2Bn/EuDtiixvYP4sZN+GkWH+WI8aVixkqcKnYQglbJHYGahgnFzuCIuSkYgdlnEzMUIclYgbeYYbMq2+GrL76dYbMq29GYh3pQi4hNngh5nexxUuxv4kZL4avxQ4vx12KDV6OuRIz3gBfiPEWok6WaP1kQ5Ksblg37XxBkKxnE0JYNfMVxZzxHgzQgU9ik/MebGpDjmIWeIOfNYeMzIC7NnzSjIpDRibSU/hC2+kFG8k1TI9wYtrV1jLSD602nFnUHl9IRYvm8J1BK15IRmsNP9iU4oVktJYoVF1U7kPMkhLrLir+ENsycWh3jVwfYsqtYv2A0SFOlZiWS/GiUWSkSoyH9ohjkZH8Jx6jTffBaQ4xAWXpmnEfOsRIsepOdKSHQ4r5h3eCCg6MJE0440eowLAomusNOtic+Km8hKPYIE2rmeiIyYq3k3jVExPS7Kd4NTt0oKwYw0vCRcjSedl/oj6r7MGlT3eqsu+girzK0/uqvDf6k00SMbYX/C/CQMCk/p5pZOLRn8ztqCC2snxpv/1YmZgwKX82WnDRYo7mm2NmOMjYdN81HfqCx4hiwuLrbRaawplmxjfmYdvlr7cGQvY2nPHDOQaLfB7MIWZIGWPALiI2N3EeRJ8wDjfMzeP/dKyf87AJP9p6gpinD99pZxyMbdG/CMUPcyFzNEf1MD7OPy+76MOcUcCzCQKmTrIV4aBszofbxe0mMRTLmSAdbhM32EroJonZb/kNth5FENaEUBLuxCZqhs1LzEt2E9WhlFE03Y/ctnFvUMo+CAY95TbKe0Y5z+mPc82JwxAZj9ySnlOHIXcOFrvVl5eYEwdecsal1GtSR3xyCOPqyyKtd6jZDRe19r94reIxLgHz4oWPavWD63374vZLh2v4FUf1+7xOrfft9PhNC1OtOaFWO0atBpRaLTeVm4zqt1W9yeyqt87VbxZ8h5nrNoTWb4Gt3/Rbv81ZP2Jcq5W9XvN+/esK9S9o1L+Soq82XPvaUf2LVvWvltW/TFft+uA/KC/DMJRCYf4AAAAASUVORK5CYII='
  //     }, {
  //       pagePath: 'pages/tabbar/my',
  //       text: '我的',
  //       iconPath: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAABdUExURUdwTP///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////4QdHNMAAAAedFJOUwCpbzAW/OYF88Whzg3YIUZReTonkev4s5mHumZfvJdc0moAAAG4SURBVHjajVVZloQgDERcABHXdmsd7n/MeQTG16YJY/1ZVMQUoWQRTMOPkdL8DBN7glHZC2r8Vy5qe0Mt0vpCWQRdpPSNDjJpjPyraBiNDCTlNkIzWwmPGa3vQWCmyy4DRE82bPwn4E80IrWBbD+pVqa2AEeHOzeAt0TB7BoukM+u8ZnwFM4Ws3AwcWcn8DDqdHyocre0YXZzbB4fC7e0YnZ1LDEeC/QXcWK5Mai/7s513ok4OCxGXsKp2S6/Tm6w/mwIvCx6HwfiRV+HCgRrGwZphccqcSG6xQLUfhy7soClYwn0pUUo+2QEnDMumE9By3llI6g4UZJrS0BHZ2lYbIDU2c75nmlpA5aBDjBZd+Iiu1oSgSbWIOd4gYeSVdzodwikIjIwIZ7e4msmJGF5L/GEnN6+nBHIvd3ntakEfctItFAhi897Xo4sgbH8SIjROhwsiQNE/qVv8CAhRqrW4iChQ8i6PneUX8l/x84Yq9AGyS0qH5BlxR6g8qF5ENeciIiT1Si9aHT+V6GI7CSyVzHjehBPCoQ7bcNm3/vTrmeIbP2sQEOQK2xS2ibFWiWz5llBk0nV/gKTGENtozD19gAAAABJRU5ErkJggg=='
  //     }]
  //   }
  // }
  // console.log(1112)
  // const appPath = ''
  const code = transformRN('app', appPath)
  console.log(code)
  fs.writeFileSync(path.join(appPath, 'rn.js'), code)
  const pagePath = ''
  const pagecode = transformRN('page', pagePath)
  fs.writeFileSync(path.join(appPath, 'page.js'), pagecode)

  //
  compiler.generateBabelConfig()
}
