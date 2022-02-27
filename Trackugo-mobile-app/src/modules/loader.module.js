/**
 * Component to render side drawer for navigation.
 */

import React from 'react';
import {
  View,
  Modal,
  ActivityIndicator
} from 'react-native';

import mainStyle from '../styles/main.style';

import Colors from '../modules/colors.module';

export default loader = props => {

  const { loading } = props;

  return (
    <Modal
      transparent={true}
      animationType={'none'}
      visible={loading}
      onRequestClose={() => {}}>
      <View style={mainStyle.modalBackground}>
        <View style={mainStyle.activityIndicatorWrapper}>
          <ActivityIndicator animating={loading} color={Colors.theme.mainColor} />
        </View>
      </View>
    </Modal>
  );
}