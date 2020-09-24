interface NavigateBase {
  success?: Function
  fail?: Function
  complete?: Function
}

export interface NavigateOptions extends NavigateBase {
  url: string
}

export interface NavigateBackOption extends NavigateBase {
  delta: number
}



