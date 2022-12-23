/**
 * ✔ hoverStyle (hover-class)
 * ✘ hover-stop-propagation
 * ✔ hoverStartTime
 * ✔ hoverStayTime
 */

import * as React from 'react'
import {
  View,
  Text,
} from 'react-native'
import { extracteTextStyle, omit } from '../../utils'
import { Animated, useAnimatedStyle, useSharedValue, buildAnimateStyle, buildAnimateValue } from '../../utils/animate'
import ClickableSimplified, { clickableHandlers } from '../ClickableSimplified'
import { _ViewProps } from './PropsType'

const stringToText = (child: any, props: any) => {
  // TODO: 实现小程序中效果
  return (typeof child === 'string' || typeof child === 'number')
    ? <Text {...omit(props, clickableHandlers)}>{child}</Text> : child
}

const _View: React.ForwardRefExoticComponent<_ViewProps & React.RefAttributes<any>> = React.forwardRef((props: _ViewProps, ref: React.ForwardedRef<any>) => {
  const textStyle = extracteTextStyle(props.style)
  // 兼容View中没用Text包裹的文字 防止报错 直接继承props在安卓中文字会消失？？？
  const child = Array.isArray(props.children) ? props.children.map((c: any, i: number) => stringToText(c, { key: i, ...props, style: textStyle })) : stringToText(props.children, { ...props, style: textStyle })
  if (Animated) {
    const property = {
      width: useSharedValue(0),
      height: useSharedValue(0),
      top: useSharedValue(0),
      bottom: useSharedValue(0),
      left: useSharedValue(0),
      right: useSharedValue(0),
      backgroundColor: useSharedValue(0),
      opacity: useSharedValue(1),
    }
    const transform = {
      translateX: useSharedValue(0),
      translateY: useSharedValue(0),
      scale: useSharedValue(1),
      scaleX: useSharedValue(1),
      scaleY: useSharedValue(1),
      rotate: useSharedValue(0),
      rotateX: useSharedValue(0),
      rotateY: useSharedValue(0),
      rotateZ: useSharedValue(0),
      skewX: useSharedValue(0),
      skewY: useSharedValue(0),
    }
    let animateStyle = {}

    const [curAnimation, setCurAnimation] = React.useState({
      options: {},
      rules: [],
      transform: []
    })
    React.useEffect(() => {
      const steps = props.animation?.steps ?? []
      steps.forEach((item: any, index: number) => {
        const { options, rules = [], transform = [] } = item
        const { duration = 100 } = options
        setTimeout(() => {
          setCurAnimation({
            options: options,
            rules: rules,
            transform: transform
          })
        }, index * duration)
      })
    }, [props.animation])

    animateStyle = useAnimatedStyle(() => {
      const valObj = buildAnimateValue(curAnimation, property, transform)
      const options: any = curAnimation.options ?? {}
      const result = buildAnimateStyle(options, valObj.property, valObj.transform)
      return {
        ...result.properyStyle,
        transform: result.transformStyle
      }
    }, [curAnimation])

    return (
      <Animated.View
        ref={ref}
        style={[props.style, animateStyle]}
        {...props}
      >
        {child}
      </Animated.View>
    )
  }
  return (
    <View
      ref={ref}
      style={props.style}
      {...props}
    >
      {child}
    </View>
  )
})

_View.displayName = '_View'

export { _View }
export default ClickableSimplified(_View)
