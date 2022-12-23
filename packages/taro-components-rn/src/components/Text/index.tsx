/**
 * ✔ selectable
 * ✘ space
 * ✘ decode: Fixed value TRUE
 */

import * as React from 'react'
import {
  Text
} from 'react-native'
import { Animated, useAnimatedStyle, useSharedValue, buildAnimateStyle, buildAnimateValue } from '../../utils/animate'
import { TextProps } from './PropsType'

const _Text: React.FC<TextProps> = ({
  style,
  children,
  selectable,
  onClick,
  animation,
  ...otherProps
}: TextProps) => {
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
      const steps = animation?.steps ?? []
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
    }, [animation])
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
      <Animated.Text
        selectable={!!selectable}
        style={[style, animateStyle]}
        onPress={onClick}
        {...otherProps}
      >
        {children}
      </Animated.Text>
    )
  }
  return (
    <Text
      selectable={!!selectable}
      style={style}
      onPress={onClick}
      {...otherProps}
    >
      {children}
    </Text>
  )
}

_Text.displayName = '_Text'

export default _Text
