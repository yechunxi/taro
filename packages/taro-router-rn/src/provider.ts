import React from 'react'
import { ScrollView } from 'react-native'
export class PageProvider extends React.Component {
  render () {
    return React.createElement(ScrollView, null, this.props.children)
  }
}
