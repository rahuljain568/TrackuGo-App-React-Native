/**
 * Component to handle Alerts related operations.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Switch,
  TextInput,
  ToastAndroid,
  SafeAreaView,
  ScrollView,
  TouchableOpacity
} from 'react-native';

import ButtonComponent from '../components/partials/Button.component';

import mainStyle from '../styles/main.style';
import alertStyle from '../styles/alert.style';

import UriConfig from '../config/uri.config';

import ApiService from '../services/api.service';

import Loader from '../modules/loader.module';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

const fields = ['overspeed', 'ignition', 'tempering', 'emergency', 'engine', 'maintenance', 'driver_behaviour', 'unplugged', 'battery','immobilize'];

export default class AlertsComponent extends Component {
  static navigationOptions = ({ navigation }) => {
    let params = navigation.state.params || {};

    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
    };
  };

  constructor() {
    super();

    this.state = {
      loading: false,
      alert: null,

      values: [],
    };

  }

  componentDidMount() {
    this.getAlert();
  }

  processInput = (value, name) => {
    this.setState({ values: { ...this.state.values, [name]: value } });
  }


  getAlert = () => {

    this.setState({ loading: true });

    ApiService.call('get', UriConfig.uri.ALERT_DETAILS, {}, (content) => {

      let alertInfo = content.alert
      this.setState({
        loading: false,
        alert: alertInfo
      });

      for (let field of fields) {
        this.setState({
          values: { ...this.state.values, [field]: alertInfo ? (alertInfo[field] || null) : null },
        });
      }

    }, (error, errors, content) => {
      this.setState({ loading: false });
    });
  }

  saveAlert = () => {

    this.setState({ loading: true });

    ApiService.call('post', UriConfig.uri.ALERT_SAVE, this.state.values, (content, status) => {

      this.setState({ loading: false });

      ToastAndroid.show(status.message, ToastAndroid.SHORT);

    }, (error, errors, content) => {
      this.setState({ loading: false });
    });
  }

  render() {

    let { values } = this.state;

    return (
      <SafeAreaView>
        <ScrollView>


          <View>
            <Loader loading={this.state.loading} />

            <View style={alertStyle.alertItem}>
              <Text style={[alertStyle.alertItemText, mainStyle.fontmd]}>Ignition</Text>
              <Switch
                style={mainStyle.flexOne}
                onValueChange={(value) => this.processInput(value, 'ignition')}
                value={values.ignition || false} />
            </View>

            <View style={alertStyle.alertItem}>
              <Text style={[alertStyle.alertItemText, mainStyle.fontmd]}>Immobilize</Text>
              <Switch
                style={mainStyle.flexOne}
                onValueChange={(value) => this.processInput(value, 'immobilize')}
                value={values.immobilize || false} />
            </View>

            <View style={alertStyle.alertItem}>
              <Text style={[alertStyle.alertItemText, mainStyle.fontmd]}>Tempering</Text>
              <Switch
                style={mainStyle.flexOne}
                onValueChange={(value) => this.processInput(value, 'tempering')}
                value={values.tempering || false} />
            </View>

            <View style={alertStyle.alertItem}>
              <Text style={[alertStyle.alertItemText, mainStyle.fontmd]}>Engine</Text>
              <Switch
                style={mainStyle.flexOne}
                onValueChange={(value) => this.processInput(value, 'engine')}
                value={values.engine || false} />
            </View>

            <View style={alertStyle.alertItem}>
              <Text style={[alertStyle.alertItemText, mainStyle.fontmd]}>Emergency/Panic</Text>
              <Switch
                style={mainStyle.flexOne}
                onValueChange={(value) => this.processInput(value, 'emergency')}
                value={values.emergency || false} />
            </View>

            <View style={alertStyle.alertItem}>
              <Text style={[alertStyle.alertItemText, mainStyle.fontmd]}>Device Unplugged</Text>
              <Switch
                style={mainStyle.flexOne}
                onValueChange={(value) => this.processInput(value, 'unplugged')}
                value={values.unplugged || false} />
            </View>

            <View style={alertStyle.alertItem}>
              <Text style={[alertStyle.alertItemText, mainStyle.fontmd]}>Maintenance</Text>
              <Switch
                style={mainStyle.flexOne}
                onValueChange={(value) => this.processInput(value, 'maintenance')}
                value={values.maintenance || false} />
            </View>

            <View style={alertStyle.alertItem}>
              <Text style={[alertStyle.alertItemText, mainStyle.fontmd]}>Overspeed</Text>
              <TextInput
                value={(values.overspeed || "").toString()}
                onChangeText={(value) => this.processInput(value, 'overspeed')}
                style={[mainStyle.formInput, mainStyle.flexOne]}
                placeholder="Overspeed Limit"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>
            
            <View style={alertStyle.alertItem}>
              <Text style={[alertStyle.alertItemText, mainStyle.fontmd]}>Battery</Text>
              <TextInput
                value={(values.battery || "").toString()}
                onChangeText={(value) => this.processInput(value, 'battery')}
                style={[mainStyle.formInput, mainStyle.flexOne]}
                placeholder="Low Battery %"
                keyboardType="numeric"
                maxLength={3}
              />
            </View>

            <View style={mainStyle.contentArea}>
              <ButtonComponent text="Save" onClick={this.saveAlert.bind(this)} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  };
}