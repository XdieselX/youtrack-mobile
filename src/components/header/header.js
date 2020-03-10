/* @flow */
import {Text, View, TouchableOpacity, StatusBar} from 'react-native';
import React, {PureComponent} from 'react';
import styles from './header.styles';
import Router from '../router/router';
import {onHeightChange} from './header__top-padding';
import {HIT_SLOP} from '../common-styles/button';

import type {Node} from 'react';
import type {ViewStyleProp} from 'react-native/Libraries/StyleSheet/StyleSheet';


type Props = {
  onBack?: () => any,
  onRightButtonClick?: Function,
  leftButton?: ?React$Element<any>,
  rightButton?: ?React$Element<any>,
  extraButton?: ?React$Element<any>,
  children?: Node,
  openScanView?: Function,
  style?: ViewStyleProp
}

type DefaultProps = {
  onRightButtonClick: Function
}

export default class Header extends PureComponent<Props, void> {
  static defaultProps: DefaultProps = {
    onRightButtonClick: () => undefined,
  };

  componentDidMount() {
    onHeightChange(() => this.forceUpdate());
  }

  onBack() {
    if (this.props.onBack) {
      return this.props.onBack();
    }
    return Router.pop();
  }

  onRightButtonClick() {
    if (this.props.onRightButtonClick) {
      return this.props.onRightButtonClick();
    }
  }

  render() {
    const {leftButton, children, extraButton, rightButton, style} = this.props;

    return (
      <View style={[styles.header, style]}>
        <StatusBar animated barStyle="dark-content"/>
        <TouchableOpacity
          testID="header-back"
          hitSlop={HIT_SLOP}
          style={styles.headerButtonLeft}
          onPress={() => this.onBack()}
        >
          <Text style={styles.headerButtonText} numberOfLines={1}>{leftButton}</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter} testID="header-content">{children}</View>

        {extraButton}

        <TouchableOpacity
          testID="header-action"
          hitSlop={HIT_SLOP}
          style={styles.headerButtonRight}
          onPress={() => this.onRightButtonClick()}>
          <Text style={styles.headerButtonText} numberOfLines={1}>{rightButton}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
