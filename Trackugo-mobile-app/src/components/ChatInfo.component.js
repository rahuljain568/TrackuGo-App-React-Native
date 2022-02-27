/**
 * Component to handle profile related operations.
 */

import React, { Component } from "react";
import {
  View,
  Text,
  TextInput,
  ToastAndroid,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";

import { Icon } from "react-native-elements";

import ButtonComponent from "../components/partials/Button.component";

import UriConfig from "../config/uri.config";

import mainStyle from "../styles/main.style";
import profileStyle from "../styles/profile.style";

import ApiService from "../services/api.service";
import StorageService from "../services/storage.service";
import GeneralService from "../services/general.service";
import NavigationService from "../services/navigation.service";

import Loader from "../modules/loader.module";
import Colors from "../modules/colors.module";

import { ScrollView } from "react-native-gesture-handler";

export default class ChatInfoComponent extends Component {
  constructor() {
    super();

    this.state = {
      user: null,
      loading: false,
      editing: false,

      errors: [],
      values: [],
      messages: [],
    };
  }

  async componentDidMount() {
      const { navigation } = this.props;
    let user = await navigation.getParam('sendTo',null);

    this.setState({
      user: user,
      values: {
        profile_name: user.profile_name,
        email: user.email,
        phone: user.phone,
      },
    });
  }



  render() {
    let { user, values } = this.state;

    return (
      <SafeAreaView>
        <ScrollView>

          {(
            <View>

              <View style={profileStyle.upperPart}>
                <View style={profileStyle.iconView}>
                  <Icon
                    name="user"
                    type="font-awesome"
                    size={75}
                    color={Colors.white}
                  />
                </View>
                <Text
                  style={[
                    mainStyle.whiteText,
                    mainStyle.textxl,
                    mainStyle.fontbl,
                  ]}
                >
                  {user ? user.profile_name : null}
                </Text>
              </View>

              <View style={profileStyle.lowerPart}>
                <View style={profileStyle.section}>
                  <View style={profileStyle.sectionText}>
                    <Text
                      style={[profileStyle.sectionTextSub, mainStyle.fontrg]}
                    >
                      Phone
                    </Text>
                    <Text
                      style={[profileStyle.sectionTextMain, mainStyle.fontmd]}
                    >
                      {user ? user.phone : null}
                    </Text>
                  </View>
                </View>
                <View style={profileStyle.section}>
                  <View style={profileStyle.sectionText}>
                    <Text
                      style={[profileStyle.sectionTextSub, mainStyle.fontrg]}
                    >
                      Email
                    </Text>
                    <Text
                      style={[profileStyle.sectionTextMain, mainStyle.fontmd]}
                    >
                      {user ? user.email : null}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }
}
