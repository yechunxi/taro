const EASE_MAP = {
  linear: 'linear',
  ease: 'ease',
  'ease-in': 'in',
  'ease-in-out': 'inOut',
  'ease-out': 'out',
  'step-start': 'linear',
  'step-end': 'linear',
}
let Animated, useAnimatedStyle, useSharedValue, Easing, withDelay, withTiming
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const reanimated = require('react-native-reanimated')
  Animated = reanimated.default
  useAnimatedStyle = reanimated.useAnimatedStyle
  useSharedValue = reanimated.useSharedValue
  Easing = reanimated.Easing
  withDelay = reanimated.withDelay
  withTiming = reanimated.withTiming
} catch (error) { }

const buildAnimateStyle = (options, property, transform) => {
  'worklet'
  const { duration = 100, timingFunction = 'linear', delay = 0 } = options
  const config = {
    duration: duration,
    easing: Easing[EASE_MAP[timingFunction]]
  }
  const properyStyle = {}
  for (const key in property) {
    if (!!property[key].value || key === 'opacity') {
      properyStyle[key] = withDelay(delay, withTiming(property[key].value, config))
    }
  }
  const transformStyle: any = []
  for (const key in transform) {
    const transformValue = (key.includes('rotate') || key.includes('skew')) ? `${transform[key].value}deg` : transform[key].value
    transformStyle.push({
      [key]: withDelay(delay, withTiming(transformValue, config)),
    })
  }
  return {
    properyStyle,
    transformStyle
  }
}

const buildAnimateValue = (curAnimation, property, transform) => {
  'worklet'
  const curProperty = curAnimation.rules ?? []
  curProperty.forEach((item: any) => {
    property[item.key].value = item.value
  })
  const curTransform = curAnimation.transform ?? []
  curTransform.forEach((itm: any) => {
    if (Object.prototype.hasOwnProperty.call(transform, itm.key)) {
      transform[itm.key].value = itm.value
    }
  })
  return {
    property,
    transform
  }
}

export {
  EASE_MAP,
  Animated,
  useAnimatedStyle,
  useSharedValue,
  Easing,
  withDelay,
  withTiming,
  buildAnimateStyle,
  buildAnimateValue
}
