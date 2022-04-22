/**
 * Component to view devices list, save or update device etc.
 */

import React, { Component } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Switch,
  ToastAndroid,
  Alert,
} from "react-native";

import { Icon,Avatar,ListItem,SearchBar } from "react-native-elements";

import UriConfig from "../config/uri.config";

import mainStyle from "../styles/main.style";
import deviceStyle from "../styles/device.style";

import Colors from "../modules/colors.module";
import Icons from "../modules/icons.module";

import ApiService from "../services/api.service";
import GeneralService from "../services/general.service";
import StorageService from "../services/storage.service";
import NavigationService from "../services/navigation.service";
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';


export default class ChatComponent extends Component {
  static navigationOptions = ({ navigation }) => { 
    let params = navigation.state.params || {},
    device = params.device || null;
    return {
      headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
      ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
    };
  };
  constructor() {
    super();

    this.state = {
      page: 1,
      nextPage: null,
      isEnabled: false,
      refreshing: false,
      users: [],
      searchUsers:[],
      showSearchBar:false,
      searchText:''
    };
  }

  async componentDidMount() {
    // this.props.navigation.setParams({handleToggle:this.toggleSearch})
    // let user = JSON.parse(await StorageService.fetch("user")),
    //   baseUrl = await StorageService.fetch("assets_url"),
    //   folders = JSON.parse(await StorageService.fetch("folders"));

    // this.setState({
    //   user: user,
    //   iconBaseUrl: baseUrl + folders.vehicle_icons,
    // });

    // this.props.navigation.addListener("didFocus", (payload) => {
    //   this.getUsers();
    // });
  }

  getUsers(page) {
    this.setState({ refreshing: true });

    if (!page) {
      this.setState({ users: [] });
    }

    ApiService.call(
      "get",
      UriConfig.uri.CHATUSERS + (page ? "?page=" + page : ""),
      {},
      (content) => {
        console.log('content',content);
        let users = content.users;
        // users.items = users.items.filter((dev, id) => {
        //   return dev.immobilizer_status;
        // });

        this.setState({
          refreshing: false,
          nextPage: users.next_page,
          users: page ? [...this.state.users, ...users] : users,
          searchUsers: page ? [...this.state.searchUsers, ...users] : users,
        });
      },
      (error, errors, content) => {
        this.setState({ refreshing: false });
      }
    );
  }

  nextPageUsers = () => {
    let { page, nextPage } = this.state;

    if (nextPage && nextPage !== page) {
      this.setState({ page: nextPage }, () => {
        this.getUsers(nextPage);
      });
    }
  };

  toggleSearch = ()=>{
    console.log("toggled");
    this.setState({
      showSearchBar:!this.state.showSearchBar
    })
  }

  searchFilterFunction = text => {
    this.setState({
      searchText: text,
    });

    const newData = this.state.searchUsers.filter(item => {
    const itemData = `${item.profile_name.toUpperCase()} ${item.username.toUpperCase()}`;
    const textData = text.toUpperCase();

    return itemData.indexOf(textData) > -1;
    });
    this.setState({
      users: newData,
    });
  };

  render() {
    let { users, refreshing, iconBaseUrl, user, isEnabled } = this.state;

    console.log("usre", user);
    console.log("Users", users);

    return (
      <View style={mainStyle.body}>
        <View>
          <View style={!this.state.showSearchBar && {display:"none"}}>
            <SearchBar
              placeholder="Type Here..."
              lightTheme
              round
              onChangeText={(text) => this.searchFilterFunction(text)}
              autoCorrect={false}
              value={this.state.searchText}
            />
          </View>
          <Text style={{textAlign:'center',fontSize:20,marginTop:'50%'}}>Coming Soon</Text>
          {/* <FlatList
            data={users}
            refreshing={refreshing}
            onRefresh={() => this.getUsers()}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => item._id}
            onEndReached={() => this.nextPageUsers()}
            renderItem={({ item, index, separators }) => {
              let iconfile = iconBaseUrl
                ? iconBaseUrl + GeneralService.deviceSideviewIcon(item)
                : null;

              return (
                <TouchableOpacity
                  onPress={() =>
                    NavigationService.navigate("homeStack", "ChatBox", {
                      sendTo: item,
                      username: item.username,
                    })
                  }
                >
                  <ListItem
                    key={item._id}
                    bottomDivider
                    leftAvatar={{
                      size: "medium",
                      icon: {
                        name: "user",
                        type: "font-awesome",
                      },
                      showAccessory: true,
                    }}
                    title={item.profile_name}
                    subtitle={item.username}
                    titleStyle={{fontWeight:"bold"}}
                    rightTitle = {GeneralService.dateFormat(item.last_updation, 'Y-m-d')}
                    rightTitleStyle = {{fontSize:10,fontWeight:"bold",alignItems:'flex-start',justifyContent:'flex-start'}}
                    rightSubtitle = {item.pending_message.toString()}
                    rightSubtitleStyle = {{display:item.pending_message>0?'flex':'none',
                                            borderRadius:50,
                                            backgroundColor:'green',color:'white',
                                            height:15,width:15,fontSize:13,
                                            textAlign:'center'}}
                    containerStyle = {{paddingTop:7,paddingBottom:7}}
                  />
                </TouchableOpacity>
              );
            }}
          /> */}
        </View>
      </View>
    );
  }
}
