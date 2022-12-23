interface IAnimationAttr {
  duration: number
  delay: number
  timingFunction: string
  transformOrigin: string
}

class Animation {
  // 属性组合
  rules: Record<string, any>[] = []
  // tranform组合
  transform: Record<string, any>[] = []

  steps: Record<string, any>[] = []

  DEFAULT: IAnimationAttr

  constructor({
    duration = 400,
    delay = 0,
    timingFunction = 'linear',
    transformOrigin = '50% 50% 0',
  }: Taro.createAnimation.Option = {}) {
    this.DEFAULT = { duration, delay, timingFunction, transformOrigin }
  }
  backgroundColor(value) {
    this.rules.push({
      key: 'backgroundColor',
      value: value,
    })
    return this
  }
  opacity(value) {
    this.rules.push({
      key: 'opacity',
      value: value,
    })
    return this
  }
  width(value) {
    this.rules.push({
      key: 'width',
      value: value,
    })
    return this
  }
  height(value) {
    this.rules.push({
      key: 'height',
      value: value,
    })
    return this
  }
  top(value) {
    this.rules.push({
      key: 'top',
      value: value,
    })
    return this
  }
  bottom(value) {
    this.rules.push({
      key: 'bottom',
      value: value,
    })
    return this
  }
  left(value) {
    this.rules.push({
      key: 'left',
      value: value,
    })
    return this
  }
  right(value) {
    this.rules.push({
      key: 'right',
      value: value,
    })
    return this
  }
  rotate(angle) {
    this.transform.push({ key: 'rotate', value: `${angle}deg` })
    return this
  }
  rotateX(angle) {
    this.transform.push({ key: 'rotateX', value: `${angle}deg` })
  }
  rotateY(angle) {
    this.transform.push({ key: 'rotateY', value: `${angle}deg` })
  }
  rotateZ(angle) {
    this.transform.push({ key: 'rotateZ', value: `${angle}deg` })
  }
  rotate3d(x, y, z, angle) {
    console.warn('Warning: rotate3d method not implemented')
    this.transform.push({ key: 'rotate3d', value: [x, y, z, angle] })
  }
  scale(sx, sy) {
    if (!!sx) {
      this.transform.push({ key: 'scaleX', value: sx })
    }
    if (!!sy) {
      this.transform.push({ key: 'scaleY', value: sy })
    }
    return this
  }
  scale3d(x, y, z) {
    console.warn('Warning: scale3d method not implemented')
    this.transform.push({
      key: 'scale3d',
      value: [x, y, z],
    })
    return this
  }
  scaleX(sx) {
    this.transform.push({ key: 'scaleX', value: sx })
    return this
  }
  scaleY(sy) {
    this.transform.push({ key: 'scaleY', value: sy })
    return this
  }
  scaleZ(sz) {
    console.warn('Warning: scaleZ method not implemented')
    this.transform.push({ key: 'scaleZ', value: sz })
    return this
  }
  matrix(a, b, c, d, tx, ty) {
    console.warn('Warning: matrix method not implemented')
    this.transform.push({ key: 'matrix', value: [a, b, c, d, tx, ty] })
    return this
  }
  matrix3d(a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3, a4, b4, c4, d4) {
    console.warn('Warning: matrix3d method not implemented')
    this.transform.push({ key: 'matrix3d', value: [a1, b1, c1, d1, a2, b2, c2, d2, a3, b3, c3, d3, a4, b4, c4, d4] })
    return this
  }
  skew(ax, ay) {
    if (ax) {
      this.skewX(ax)
    }
    if (ay) {
      this.skewY(ay)
    }
    return this
  }
  skewX(angle) {
    this.transform.push({
      key: 'skewX',
      value: `${angle}deg`,
    })
    return this
  }
  skewY(angle) {
    this.transform.push({
      key: 'skewY',
      value: `${angle}deg`,
    })
    return this
  }
  translate(tx, ty) {
    if (!!tx) {
      this.translateX(tx)
    }
    if (!!ty) {
      this.translateY(ty)
    }
    return this
  }
  translateX(translation) {
    this.transform.push({
      key: 'translateX',
      value: translation,
    })
    return this
  }
  translateY(translation) {
    this.transform.push({
      key: 'translateY',
      value: translation,
    })
    return this
  }
  // 暂未实现
  translateZ(translation) {
    console.warn('Warning: translateZ method not implemented')
    this.transform.push({
      key: 'translateZ',
      value: translation,
    })
    return this
  }
  // 暂未实现
  translate3d(tx,ty, tz) {
    console.warn('Warning: translate3d method not implemented')
    if (!!tx) {
      this.translateX(tx)
    }
    if (!!ty) {
      this.translateY(ty)
    }
    if(!!tz){
      this.transform.push({
        key: 'translateZ',
        value: tz,
      })
    }
    return this
  }
  step(arg: Partial<IAnimationAttr> = {}) {
    const {
      duration = this.DEFAULT.duration,
      timingFunction = this.DEFAULT.timingFunction,
      delay = this.DEFAULT.delay,
      transformOrigin = this.DEFAULT.transformOrigin,
    } = arg
    this.steps.push({
      options: {
        duration,
        timingFunction,
        delay,
        transformOrigin,
      },
      rules: this.rules.slice(0),
      transform: this.transform.slice(0),
    })
    this.transform = []
    this.rules = []
  }
  export() {
    const result = {
      options: {},
      steps: this.steps.concat([]),
    }
    this.steps = []
    return result
  }
}
export function createAnimation(option) {
  return new Animation(option)
}
