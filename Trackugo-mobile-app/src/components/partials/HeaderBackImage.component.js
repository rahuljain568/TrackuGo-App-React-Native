/**
 * Component to render custom image for back button in header.
 */

import React, { Component } from 'react';
import { View } from 'react-native';

import { Icon } from 'react-native-elements';

import Colors from '../../modules/colors.module';

export default class HeaderBackImageComponent extends Component {

  render() {
    return (
      <View style={{ padding: 10 }}>
        <Icon name='angle-left' type='font-awesome' color={Colors.white} size={38} />
      </View>
    );
  };
}