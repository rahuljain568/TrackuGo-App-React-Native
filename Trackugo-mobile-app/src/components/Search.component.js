/**
 * Component to handle device search related operations.
 */

import React, { Component } from 'react';
import {
  View,
  TextInput
} from 'react-native';

import mainStyle from '../styles/main.style';
import searchStyle from '../styles/search.style';

import NavigationService from '../services/navigation.service';

export default class SearchComponent extends Component {

  static navigationOptions = {
    headerTitle: (
      <View style={searchStyle.searchView}>
        <TextInput style={[searchStyle.searchInput]} placeholder="Search..."></TextInput>
      </View>
    ),
    headerStyle: {
      elevation: 0
    }
  };

  render() {
    return (
      <View style={mainStyle.contentArea}>

      </View>
    );
  };
}
