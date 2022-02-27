/**
 * Component to view devices list, save or update device etc.
 */

import React,  { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Switch,
  ToastAndroid,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TouchableHighlight
} from "react-native";

import { Icon,ListItem } from "react-native-elements";
import ActionButton from 'react-native-action-button';
import {ActionSheetCustom as ActionSheet} from 'react-native-custom-actionsheet'

import UriConfig from "../config/uri.config";

import mainStyle from "../styles/main.style";
import deviceStyle from "../styles/device.style";

import Colors from "../modules/colors.module";
import Icons from "../modules/icons.module";

import ApiService from "../services/api.service";
import GeneralService from "../services/general.service";
import StorageService from "../services/storage.service";
import NavigationService from "../services/navigation.service";
import socketIOClient from "socket.io-client";
import ImagePicker from "react-native-image-crop-picker";
import RNFetchBlob from "rn-fetch-blob";
import { v4 as uuidv4 } from "uuid";
import {
  GiftedChat,
  Bubble,
  Send,
  SystemMessage,
  Actions,
} from "react-native-gifted-chat";

import {IconButton} from "react-native-paper";
// import BackgroundGeolocation from "@mauron85/react-native-background-geolocation";
import LocationChat from "./LocationChat.component";
import LiveLocationChat from "./LiveLocationChat.component";
import { SendLiveLocation } from "./SendLiveLocation.component";

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sendingContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  bottomComponentContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  systemMessageWrapper: {
    backgroundColor: "#6646ee",
    borderRadius: 4,
    padding: 5,
  },
  systemMessageText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
    width: "100%",
    height: "100%",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: 250,
    height: 250,
  },
  openButton: {
    backgroundColor: "#f39820",
    borderRadius: 20,
    padding: 10,
    margin:20,
    elevation: 2,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
  },
});

const SOCKET_SERVER_URL = "http://api-staging.trackugo.in:9001";
const ImagePath = RNFetchBlob.fs.dirs.DCIMDir;

 const ChatComponent = (props)=>{

  const [roomId,setRoomId]  = React.useState(null);
  const [newMessage, setNewMessage] = React.useState([]);
  const [user,setUser] = React.useState({});
  const [userTo,setUserTo] = React.useState({});
  const [refreshing,setRefreshing] = React.useState({});
  const [messages, setMessages] = useState([]); // Sent and received messages
  const [modalVisible, setModalVisible] = useState(false);
  const socketRef = useRef();
  const actionSheetRef = useRef();
        useEffect(() => {
                console.log("ChatBox Props",props);
                  let { navigation } = props;
                  let sendTo = navigation.getParam("sendTo", null);
                (async ()=>{
                    let user = JSON.parse(await StorageService.fetch("user")),
                      baseUrl = await StorageService.fetch("assets_url"),
                      folders = JSON.parse(await StorageService.fetch("folders"));
                      let roomName = `${user.username}${sendTo.username}`;
                    setUser(user);
                    setUserTo(sendTo);
                    ApiService.call("get",UriConfig.uri.CHATROOM +("?user=" +user._id +"&sendTo=" +sendTo._id +"&roomName=" +roomName),{},
                      (content) => {
                        console.log("API Response",content);
                        let room = content.room;
                        setRoomId(room._id);
                        setMessages([
                          ...room.messages,
                        ]);
                        setRefreshing(false);
                        // Creates a WebSocket connection
                    socketRef.current = socketIOClient(
                      SOCKET_SERVER_URL,
                      {
                        query: { user:user._id, roomId:room._id },
                        transports: ["websocket"],
                      }
                    );

                    // Listens for incoming messages
                    room._id && socketRef.current.on(`messageFor${room._id.toString()}`,async (message) => {
                        console.log("Incomming Message",JSON.parse(message));
                        let msg = JSON.parse(message);
                        // if(msg.image.length>0){
                        //     msg.image = `file:///${msg.path}`;
                        // } 
                        for(let senduser in msg.sendTo){
                          console.log("sending",senduser,msg)
                          if (msg.sendTo[senduser]._id == user._id) {
                            if(msg.image.length>0){
                              const data = await RNFetchBlob.fs.writeFile(msg.path, msg.text, 'base64');
                            }
                            console.log("sending confirmation");
                            msg.received = true;
                            socketRef.current.emit(`meessageRecievedFor${room._id.toString()}`,msg);
                          }
                        }
                        let newArray = [msg];
                        
                        let _pos = messages.findIndex((me,id)=>me._id == msg._id)
                        console.log("Message Modified",msg,_pos);
                        _pos == -1
                          ? setMessages((messages) => [...messages,...newArray])
                          : null
                          // : setMessages((messages) => messages[_pos].received = true);
                          console.log('New Message Array',messages)
                      }
                    ); 
                      room._id &&
                        socketRef.current.on(`messageConfirmationFor${room._id.toString()}`,(message)=>{
                            console.log("Incoming Confirmation")
                            let msg = JSON.parse(message);
                            console.log("Confirmation Message",msg);
                            if (msg.user._id == user._id) {
                              let _pos = messages.findIndex((me,id)=>me._id == msg._id)
                                setMessages((messages) => messages[_pos].received = true);
                            }
                            console.log(messages);
                          }
                        );
                        props.navigation.addListener(
                          "didFocus",
                          (payload) => {}
                        );
                      },
                      (error, errors, content) => {
                        setRefreshing(false);
                      }
                    );
                    
                  })() 
                  return ()=>{
                    console.log("Unmount")
                    socketRef.current.emit('disconnect');
                    socketRef.current.disconnect();
                    console.log("Socket Disconnected");
                  }
          }, []);
        // Sends a message to the server that
        // forwards it to all users in the same room
        const sendMessage = (msg, roomId, userFrom, userTo,image,location_address,path,locationCoordinate,expiry_time,isLiveLocation,isLocationTracking,share_location_id) => {
          console.log("Message sending",msg)
          socketRef.current.emit(`messageTo${roomId}`, {
            msg: msg,
            userFrom: userFrom,
            roomId: roomId,
            userTo: userTo,
            location_address: location_address,
            isImage: image,
            path: path,
            locationCoordinate: locationCoordinate,
            expiry_time: expiry_time,
            isLiveLocation: isLiveLocation,
            isLocationTracking: isLocationTracking,
            share_location_id: share_location_id,
          });
          // setMessages(messages.push(message));
        };
        handleSend = (messages)=> {
          const text = messages[0].text;
          sendMessage(text,roomId,user,userTo,false,null,null,null,null,null,null,null);
        }

        renderBubble = (props) => {
          const { currentMessage } = props;
          console.log("Message Bubble",props.currentMessage);
          if (
            currentMessage.image.length == 0 &&
            currentMessage.locationCoordinate &&
            !currentMessage.isLiveLocation
          ) {
            return (
              <LocationChat
                location={currentMessage.locationCoordinate}
                current_address={currentMessage.location_address}
                orientation={
                  currentMessage.user._id == user._id
                    ? "right"
                    : "left"
                }
                time={currentMessage.createdAt}
              />
            );
          }
          else if (currentMessage.image.length == 0 &&
            currentMessage.locationCoordinate &&
            currentMessage.isLiveLocation){
              return (
                <LiveLocationChat
                  location={currentMessage.locationCoordinate}
                  current_address={
                    currentMessage.location_address
                  }
                  expiry_time={currentMessage.expiry_time}
                  location_id={currentMessage.share_location_id}
                  orientation={
                    currentMessage.user._id == user._id
                      ? "right"
                      : "left"
                  }
                  time={currentMessage.createdAt}
                />
              );
            }
          return (
            <Bubble
              {...props}
              wrapperStyle={{
                right: {
                  backgroundColor: "#ccc",
                },
                left: {
                  backgroundColor: "#ccc",
                },
              }}
              textStyle={
                {
                  // right: {
                  //   color: "#fff",
                  // },
                }
              }
            />
          );
        };

        renderLoading = () => {
          return (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color="#6646ee"
              />
            </View>
          );
        };

        const options = [
          "Cancel",
          {
            component: (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  padding: 0,
                  width: "100%",
                }}
              >
                  <ListItem
                    key={3}
                    title="Send Photo with Location"
                    titleStyle={{ color: "black" }}
                    // leftIcon={{
                    //   name: "picture-o",
                    //   type: "font-awesome",
                    //   size: 32,
                    // }}
                    leftElement={<Image
                      source={require('../assets/images/noun_Photo_Location.png')}
                      style={{width:32,height:32}}
                      />}
                  />
              </View>
            ),
            height: 60,
          },
          {
            component: (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  padding: 0,
                  width: "100%",
                }}
              >
                  <ListItem
                    key={2}
                    title="Open Camera"
                    titleStyle={{ color: "black" }}
                    // leftIcon={{
                    //   name: "camera",
                    //   type: "font-awesome",
                    //   size: 32,
                    // }}
                    leftElement={<Image
                      source={require('../assets/icons/Icons/noun_Camera.png')}
                      style={{width:32,height:32}}
                      />}
                  />
              </View>
            ),
            height: 60,
          },
          {
            component: (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  padding: 0,
                  width: "100%",
                }}
              >
                <ListItem
                  key={1}
                  title="Send Your Location"
                  titleStyle={{ color: "black" }}
                  // leftIcon={{
                  //   name: "map-marker",
                  //   type: "font-awesome",
                  //   size: 32,
                  // }}
                  leftElement={<Image
                    source={require('../assets/icons/Icons/location3.png')}
                    style={{width:32,height:32}}
                    />}
                />
              </View>
            ),
            height: 60,
          },
          {
            component: (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  padding: 0,
                  width: "100%",
                }}
              >
                <ListItem
                  key={0}
                  title="Send Tracking Request"
                  // leftIcon={{
                  //   name: "location-arrow",
                  //   type: "font-awesome",
                  //   size: 32,
                  // }}
                  leftElement={<Image
                    source={require('../assets/icons/Icons/route.png')}
                    style={{width:32,height:32}}
                    />}
                />
              </View>
            ),
            height: 60,
          },
        ];

        renderAction = (props) => {
          return (
            <Actions {...props}>
              <View style={styles.sendingContainer}>
              </View>
            </Actions>
          );
        };
        renderSend = (props) => {
          return (
            <Send {...props}>
              <View style={styles.sendingContainer}>
                <IconButton
                  icon="send-circle"
                  size={32}
                  color="#6646ee"
                />
              </View>
            </Send>
          );
        };

        scrollToBottomComponent = () => {
          return (
            <View
              style={styles.bottomComponentContainer}
            >
              <IconButton
                icon="chevron-double-down"
                size={36}
                color="#6646ee"
              />
            </View>
          );
        };

        renderSystemMessage = (props) => {
          return (
            <SystemMessage
              {...props}
              wrapperStyle={styles.systemMessageWrapper}
              textStyle={styles.systemMessageText}
            />
          );
        };

        onPressActionButton = () =>{
          actionSheetRef.current.show();
        }
        handlePress = (index)=>{
          console.log("Index",index);
          // actionSheetRef.current.hide();
          switch(index){
                case 1:
                  ImagePicker.openCamera({
                    width: 300,
                    height: 400,
                    cropping: true,
                    includeBase64: true,
                    includeExif: true,
                  }).then(async (image) => {
                    console.log(image);
                    let myPath = `${ImagePath}/${uuidv4()}.png`;
                    let address = 'Not Avaialable';
                    let locationCoordinate = {};
                    const data = await RNFetchBlob.fs.writeFile(myPath, image.data, 'base64');
                    BackgroundGeolocation.getCurrentLocation(lastLocation => {
                      locationCoordinate = {
                        type: "Point",
                        coordinates: [
                          lastLocation.longitude,
                          lastLocation.latitude,
                        ],
                      };
                     address = GeneralService.geocodingReverse(
                      {
                        latitude: lastLocation.latitude,
                        longitude: lastLocation.longitude,
                      },
                      (address) => {
                        return address;
                      },
                      (error) => {
                        return error;
                      }
                    );
                    console.log("Current Address",address,lastLocation)
                    }, (error) => {
                      setTimeout(() => {
                        Alert.alert('Error obtaining current location', JSON.stringify(error));
                      }, 100);
                    });
                    sendMessage(image.data,roomId,user,userTo,true,address,myPath,locationCoordinate,null,null,null,null,null);
                    ImagePicker.clean().then(() => {
                      return true;
                    });
                  });
                  break;
                case 2:
                  ImagePicker.openCamera({
                    width: 300,
                    height: 400,
                    cropping: true,
                    includeBase64: true,
                    includeExif:true,
                  }).then(async (image) => {
                    console.log(image);
                    let myPath = `${ImagePath}/${uuidv4()}.png`;
                    const data = await RNFetchBlob.fs.writeFile(myPath, image.data, 'base64');
                    sendMessage(image.data,roomId,user,userTo,true,null,myPath,null,null,null,null,null,null);
                    ImagePicker.clean().then(()=>{
                      return true;
                    })
                  });
                  break;
                case 3:
                  setModalVisible(true);
                  break;
                case 4:
                  sendMessage("Tracking Request Sent",roomId,user,userTo,false,null,null,null,null,null,null,true,null);
                  break;
              }
        }
        sendCurrentLocation = async () =>{
          let address = "Not Available";
          let locationCoordinate = {};
         await BackgroundGeolocation.getCurrentLocation(lastLocation => {
              locationCoordinate = {
                type: "Point",
                coordinates: [
                  lastLocation.longitude,
                  lastLocation.latitude,
                ],
              };
              address = GeneralService.geocodingReverse(
              {
                latitude: lastLocation.latitude,
                longitude: lastLocation.longitude,
              },
              (address) => {
                return address;
              },
              (error) => {
                return error;
              }
            );
            address = address?address:"Not Available"
            console.log("Current Address",address,locationCoordinate)
            setModalVisible(!modalVisible);
            sendMessage(address,roomId,user,userTo,false,address,null,locationCoordinate,null,null,null,null,null);
            }, (error) => {
              setTimeout(() => {
                Alert.alert('Error obtaining current location', JSON.stringify(error));
              }, 100);
            });
        }
        setLiveLocation = (expiry_after,location_id,location_address,locationCoordinate) =>{
          sendMessage("Live Location", roomId, user, userTo,false,location_address,null,locationCoordinate,expiry_after,true,false,location_id)
        }
      return (
        <>
          <GiftedChat
            messages={messages}
            onSend={this.handleSend}
            renderAvatar={() => null}
            user={user}
            placeholder="Type your message here..."
            alwaysShowSend
            scrollToBottom
            multiline={true}
            inverted={false}
            renderBubble={this.renderBubble}
            renderActions={this.renderAction}
            onPressActionButton={this.onPressActionButton}
            renderLoading={this.renderLoading}
            renderSend={this.renderSend}
            scrollToBottomComponent={this.scrollToBottomComponent}
            renderSystemMessage={this.renderSystemMessage}
          />
          <ActionSheet
            ref={actionSheetRef}
            options={options}
            cancelButtonIndex={0}
            destructiveButtonIndex={4}
            onPress={this.handlePress}
          />
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              // Alert.alert("Modal has been closed.");
              console.log("Modal has been closed");
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    padding: 0,
                    width: "100%",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      sendCurrentLocation();
                    }}
                  >
                    <ListItem
                      key={3}
                      title="Send Your Current Location"
                      titleStyle={{ color: "black" }}
                      leftElement={<Image
                      source={require('../assets/images/noun_gps_location.png')}
                      style={{width:40,height:40,borderRadius:50,backgroundColor:'#e7e7e7'}}
                      />}
                    />
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    padding: 0,
                    width: "100%",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      console.log("Live Location Sending");
                      setModalVisible(!modalVisible);
                      NavigationService.navigate(
                        "homeStack",
                        "LiveLocation",
                        {
                          sendTo: userTo,
                          sendLiveLocation: this.setLiveLocation,
                        }
                      );
                    }}
                  >
                    <ListItem
                      key={3}
                      title="Send Your Live Location"
                      titleStyle={{ color: "black" }}
                      leftElement={<Image
                        source={require("../assets/images/noun_Location.png")}
                        style={{width:40,height:32,borderRadius:50,backgroundColor:'#e7e7e7'}}
                        />}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableHighlight
                  style={{
                    ...styles.openButton,
                    // backgroundColor: "#2196F3",
                  }}
                  onPress={() => {
                    setModalVisible(!modalVisible);
                  }}
                >
                  <Text style={styles.textStyle}>Cancel</Text>
                </TouchableHighlight>
              </View>
            </View>
          </Modal>
        </>
      );
  }

  export default ChatComponent;
