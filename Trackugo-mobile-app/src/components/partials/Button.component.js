/**
 * Component to render custom image for back button in header.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

import Colors from '../../modules/colors.module';

export default class ButtonComponent extends Component {

  render() {

    let { text, onClick, color } = this.props;

    return (
      <TouchableOpacity onPress={() => onClick()}>
        <View style={[styles.buttonView, { backgroundColor: color || Colors.yellow }]}>
          <Text style={styles.buttonText}>{text}</Text>
        </View>
      </TouchableOpacity>
    );

  };
}

const styles = StyleSheet.create({
  buttonView: {
    padding: 10,
    borderRadius: 5
  },
  buttonText: {
    fontSize: 18,
    textAlign: "center",
    color: Colors.white,
    fontFamily: "TTNorms-Medium",
  }
});