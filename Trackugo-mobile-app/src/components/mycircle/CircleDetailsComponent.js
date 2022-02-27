/**
 * Component to show group map of devices.
 */

import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    Modal,
    TouchableOpacity, ToastAndroid, TextInput,
    FlatList, Share, Switch, Alert, TouchableWithoutFeedback, ImageBackground
} from 'react-native';

import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CheckBox from '@react-native-community/checkbox';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';
import dynamicLinks from '@react-native-firebase/dynamic-links';

import mainStyle from '../../styles/main.style';
import groupMapStyle from '../../styles/group-map.style';

import AppConfig from '../../config/app.config';

import Colors from '../../modules/colors.module';
import Icons from '../../modules/icons.module';
import deviceStyle from '../../styles/device.style';
import UriConfig from '../../config/uri.config';
import ApiService from '../../services/api.service';
import GeneralService from '../../services/general.service';
import StorageService from '../../services/storage.service';
import styles from '../../styles/circleDetails.style';
import NavigationService from '../../services/navigation.service';
import { h } from '../../styles/dimension';

let timeout;

export default class CircleDetails extends Component {

    constructor() {
        super();
        // let { latitudeDelta, longitudeDelta } = GeneralService.locationDelta(11111);

        let latitudeDelta = 0.0942, longitudeDelta = 0.0931;
        this.state = {
            mapRef: null,
            mapType: "standard",
            isTracking: false,
            isModalVisible: false,

            devices: [],
            region: {
                latitude: AppConfig.default_location.latitute,
                longitude: AppConfig.default_location.longitude,
                latitudeDelta: latitudeDelta,
                longitudeDelta: longitudeDelta
            },

            currentLocation: null,
            trackingDevices: [],
            routeColors: [],
            modelMembers: false, modelSetting: false, IsActive: true,
            circleName: "", expiry_date: ''
        }
    }

    async componentDidMount() {

        let user = JSON.parse(await StorageService.fetch('user'));
        let expiry_date = JSON.parse(await StorageService.fetch('user')).circle_subscriptions[0].expiry_date;
        // console.log(moment(expiry_date).format('DD-MM-YYYY'), 'expiry_date');
        // console.log(moment('12-02-2022','DD-MM-YYYY').format('DD-MM-YYYY'), 'current_date');
        // console.log(moment('12-02-2022','DD-MM-YYYY')>= moment(expiry_date),'condition');
        let baseUrl = await StorageService.fetch('assets_url'),
            folders = JSON.parse(await StorageService.fetch('folders'));
        let { navigation } = this.props, itemData = navigation.getParam('itemData', null);

        this.setState({ iconBaseUrl: baseUrl + folders.vehicle_icons, circleName: itemData.name, expiry_date: expiry_date });

        this.groupMapData();
    }

    componentWillUnmount() {
        this.removeTimeout();
    }

    groupMapData = () => {
        let { navigation } = this.props;
        let itemData = navigation.getParam('itemData', null);
        console.log(itemData, 'itemData');
        let { devices, trackingDevices, isTracking, region } = this.state;

        // region.latitude = itemData.users[0].location.coordinates[1];
        // region.longitude = itemData.users[0].location.coordinates[0];

        ApiService.call('get', UriConfig.uri.DEVICES_ALL, {}, (content, status) => {
            let newDevices = itemData.users;
            // newDevices.forEach(element => {
            //     let  address = GeneralService.geocodingReverse(
            //         {
            //           latitude: element.location.coordinates[1],
            //           longitude: element.location.coordinates[0],
            //         },
            //         (address) => {
            //           return address;
            //         },
            //         (error) => {
            //           return error;
            //         }
            //       );
            //       address=GeneralService.hasValue(address)?address:'Address Not Available';
            //     //   console.log(address);
            //       element.address=address;
            // });

            console.log('newDevices111', newDevices);
            this.setState({
                devices: newDevices,
                region: {
                    ...this.state.region,
                    latitude: newDevices[0].location.coordinates[1],
                    longitude: newDevices[0].location.coordinates[0],
                    // latitudeDelta: latitudeDelta,
                    // longitudeDelta: longitudeDelta,
                },
            }, () => {

                if (devices.length <= 0) {
                    this.fitToMarkersToMap();
                }

                // if (isTracking) {
                //     for (const device of newDevices) {
                //         if (device.location) {
                //             trackingDevices.push({
                //                 latitude: device.location.coordinates[1],
                //                 longitude: device.location.coordinates[0],
                //             });
                //         }
                //     }

                //     this.setState({ trackingDevices: trackingDevices });
                // }

                this.removeTimeout();

                timeout = setTimeout(() => {
                    this.groupMapData();
                }, 10000);

            });

        }, (error, errors, content) => {

        });
    }

    removeTimeout = () => {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    }

    fitToMarkersToMap = () => {
        const { devices, mapRef, currentLocation } = this.state;

        let markers = devices.map(d => d._id);

        if (currentLocation) {
            markers.push("cl");
        }

        mapRef.fitToSuppliedMarkers(
            markers,
            {
                animated: true,
                edgePadding: {
                    top: 10,
                    left: 10,
                    right: 10,
                    bottom: 10,
                },
            }
        );
    }

    toggleMapType = () => {
        this.setState({ mapType: this.state.mapType === "satellite" ? "standard" : "satellite" });
    }

    toggleTrackModal = () => {

        let { isModalVisible, isTracking } = this.state;

        this.setState({ isModalVisible: !isModalVisible });

        if (!isTracking) {
            this.setState({
                routeColors: [],
                trackingDevices: []
            });
        }

    }

    track = async (track) => {

        if (track) {

            let position = await GeneralService.currentLocation();

            this.setState({
                isTracking: true,
                isModalVisible: false,
                currentLocation: {
                    latitude: position.latitude,
                    longitude: position.longitude,
                }
            }, () => {
                this.fitToMarkersToMap();
            });
        } else {

            this.setState({
                routeColors: [],
                isTracking: false,
                trackingDevices: [],
                isModalVisible: false,
                currentLocation: null
            }, () => {
                this.fitToMarkersToMap();
            });

        }
    }

    toggleCheckbox = (deviceNumber) => {

        let { trackingDevices, routeColors } = this.state;

        if (trackingDevices[deviceNumber]) {
            delete trackingDevices[deviceNumber];
            delete routeColors[deviceNumber];
        } else {
            trackingDevices[deviceNumber] = [];
            routeColors[deviceNumber] = GeneralService.randomColor();
        }

        this.setState({
            routeColors: routeColors,
            trackingDevices: trackingDevices
        });

    }

    regionChange = (region) => {
        this.setState({
            region: {
                ...this.state.region,
                latitudeDelta: region.latitudeDelta,
                longitudeDelta: region.longitudeDelta,
            }
        });
    }

    onPressActive = (value) => {
        try {
            let { IsActive } = this.state;
            if (IsActive == false) {
                this.setState({ IsActive: true })
            } else {
                this.setState({ IsActive: false })
            }
        } catch (error) {
            console.log(error);
        }
    }

    deleteCircle() {
        Alert.alert(
            '',
            'Are you sure want to delete this circle',
            [
                { text: "NO", onPress: () => console.log('') },
                { text: "YES", onPress: () => this.deleteConfirm() },
            ],
            { cancelable: true }
        )
    }

    async deleteConfirm() {
        try {
            this.setState({ isLoading: true, modelSetting: false });
            let { navigation } = this.props,
                itemData = navigation.getParam('itemData', null)
                , uri = UriConfig.uri.DELETE_GROUP
                , params = {
                    group_id: itemData._id
                };
            ApiService.call('post', uri, params, (content) => {
                console.log('content1111111', content);
                this.setState({
                    isLoading: false,
                });
                NavigationService.navigate(
                    "homeStack", "CircleList",
                )
                ToastAndroid.showWithGravityAndOffset(
                    "Circle delete successfully",
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM,
                    25,
                    50
                );
            }, (error, errors, content) => {
                this.setState({ circle: [], isLoading: false, });
            });
        } catch (error) {
            console.log(error);
        }
    }
    removeMember(item) {
        Alert.alert(
            '',
            'Are you sure want to remove this member',
            [
                { text: "NO", onPress: () => console.log('') },
                { text: "YES", onPress: () => this.removeConfirm(item) },
            ],
            { cancelable: true }
        )
    }
    async removeConfirm(item) {
        try {
            this.setState({ isLoading: true, modelMembers: false });
            let { navigation } = this.props, user = JSON.parse(await StorageService.fetch('user'))
                , itemData = navigation.getParam('itemData', null)
                , uri = UriConfig.uri.REMOVE_FROM_GROUP
                , params = {
                    group_id: itemData._id,
                    user_id: item._id
                };
            ApiService.call('post', uri, params, (content) => {
                console.log('content1111111', content);
                this.setState({
                    isLoading: false,
                });
                NavigationService.navigate(
                    "homeStack", "CircleList",
                )
                ToastAndroid.showWithGravityAndOffset(
                    // content.status.message,
                    "Member removed successfully",
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM,
                    25,
                    50
                );
            }, (error, errors, content) => {
                this.setState({ circle: [], isLoading: false, });
            });
        } catch (error) {
            console.log(error);
        }
    }
    async updateCircle(itemData) {
        try {
            this.setState({ isLoading: true, modelCreateCircle: false, });
            let { navigation } = this.props, itemData = navigation.getParam('itemData', null);
            let user = JSON.parse(await StorageService.fetch('user'))
                , uri = UriConfig.uri.circle_updateGroup
                , params = {
                    "name": this.state.circleName,
                    // "other_admin_id": user._id

                };
            console.log(params);
            ApiService.call('put', uri + '/' + itemData._id, params, (content) => {
                console.log('content1111111', content);
                this.setState({
                    isLoading: false,
                });
                ToastAndroid.showWithGravityAndOffset(
                    "Circle updated successfully",
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM,
                    25,
                    50
                );
            }, (error, errors, content) => {
                this.setState({ circle: [], isLoading: false, });
            });
        } catch (error) {
            console.log(error);
        }
    }
    async addMember(itemData) {
        try {
            this.setState({ modelMembers: false })
            let url = await this.buildLink(itemData);
            const result = await Share.share({
                // title: 'Hey buddy install this',  
                // message: "Join " + itemData.name + " click on below link" + "\n\n" + url,
                message: "Join my " + itemData.name + ' Circle. Use my Invite Code:- "' + itemData.share_code + '"\nEnter Code or click on below link' + "\n\n" + url,
                // url: url
                //"Join my Letstrack Circle! Use my Invite Code 232-102. This Circle is created for 0 minute Enter Code or Click Here https://circle.letstrack.com/R8Xr"
            });

            if (result.action === Share.sharedAction) {
                if (result.activityType) {
                    // shared with activity type of result.activityType
                } else {
                    // shared
                }
            } else if (result.action === Share.dismissedAction) {
                // dismissed
            }
        } catch (error) {
            console.log(error);
        }
    };
    async buildLink(item) {
        const link = await dynamicLinks().buildLink({
            link: `https://${UriConfig.uri.deepLinkName}/?code=` + item.share_code,
            // domainUriPrefix is created in your Firebase console
            domainUriPrefix: UriConfig.uri.deepLinkUrlPrefix,
            android: {
                packageName: UriConfig.uri.packageName,
                minimumVersion: '1',
            },
            ios: {
                bundleId: UriConfig.uri.packageName,
                appStoreId: '',
                minimumVersion: '1',
            },
            // optional setup which updates Firebase analytics campaign
            // "banner". This also needs setting up before hand
            // analytics: {
            //     campaign: 'banner',
            // },
        });

        return link;
    }
    openUser(item) {
        try {
            if (item.location.coordinates[1] != null) {
                this.setState({ modelMembers: false })
                NavigationService.navigate("homeStack", "CircleSingle", { device: item.profile_name, id: item._id, itemData: item, circleName: this.state.circleName })
            }
            else {
                ToastAndroid.show('Current Location Unavailable.', ToastAndroid.SHORT);
            }
        } catch (error) {

        }
    }
    render() {

        let { modelMembers, modelSetting, IsActive } = this.state;
        let { navigation } = this.props, itemData = navigation.getParam('itemData', null);

        let { region, mapType, currentLocation, isTracking, devices, iconBaseUrl, isModalVisible, trackingDevices, routeColors, circleName } = this.state,
            devicesWithLocations = devices.filter(d => !!d.location);
        devicesWithLocations = devicesWithLocations.filter(d => d.location.coordinates[1] != null);
        // if (devicesWithLocations.length > 0) {
        //     devicesWithLocations.forEach(element => {
        //         let address = GeneralService.geocodingReverse(
        //             {
        //                 latitude: element.location.coordinates[1],
        //                 longitude: element.location.coordinates[0],
        //             },
        //             (address) => {
        //                 return address;
        //             },
        //             (error) => {
        //                 return error;
        //             }
        //         );
        //         address = GeneralService.hasValue(address) ? address : 'Address Not Available';
        //         //   console.log(address);
        //         element.address = address;
        //     });
        // }
        console.log(devicesWithLocations, 'devicesWithLocations');
        console.log(region, 'region11');
        // if (devicesWithLocations.length > 0) {
        //   let  address = GeneralService.geocodingReverse(
        //         {
        //           latitude: devicesWithLocations[0].location.coordinates[1],
        //           longitude: devicesWithLocations[0].location.coordinates[0],
        //         },
        //         (address) => {
        //           return address;
        //         },
        //         (error) => {
        //           return error;
        //         }
        //       );
        //       console.log(address,'address');
        //     // console.log(GeneralService.getLocationFromCordinate(devicesWithLocations[0].location.coordinates[1], devicesWithLocations[0].location.coordinates[0]));
        // }
        //console.log(GeneralService.hasValue(devicesWithLocations[0].location.coordinates[1])?devicesWithLocations[0].location.coordinates[1]:'','aaa');
        // console.log(GeneralService.getLocationFromCordinate(devicesWithLocations[0].location.coordinates[1],devicesWithLocations[0].location.coordinates[0]));
        return (
            <View style={mainStyle.flexOne}>

                <MapView
                    mapType={mapType}
                    style={mainStyle.flexOne}
                    initialRegion={region}
                    zoomControlEnabled={true}
                    ref={(ref) => { this.state.mapRef = ref }}
                    onRegionChangeComplete={this.regionChange}
                >
                    {
                        devicesWithLocations.map(device => {
                            return (
                                <Marker.Animated
                                    key={device._id}
                                    identifier={device._id}
                                    coordinate={{
                                        latitude: device.location.coordinates[1],
                                        longitude: device.location.coordinates[0],
                                    }}
                                    anchor={{ x: 0.5, y: 0.5 }}
                                // style={{ transform: [{ rotate: (Math.abs((163 + 270) % 360)) + "deg" }] }} 
                                >
                                    {/* <Image source={Icons.idle} resizeMode="contain" style={mainStyle.mapIcon} /> */}

                                    <ImageBackground style={{
                                        justifyContent: 'center', alignItems: 'center',
                                        height: 70, width: 50,
                                    }} resizeMode="contain" source={Icons.marker}>
                                        <Text style={[styles.txtListLabel, { color: "black", fontSize: 20, marginBottom: 13 }]}>{device.profile_name.slice(0, 1)}</Text>

                                    </ImageBackground>
                                    <Callout tooltip={true}>
                                        <View style={groupMapStyle.callout}>
                                            <View style={[groupMapStyle.calloutRow, { justifyContent: 'space-between' }]}>
                                                <Text style={groupMapStyle.calloutHeader}>{device.profile_name}</Text>
                                                <View style={groupMapStyle.calloutRow}>
                                                    <Icon name='battery-high' color={Colors.gray} size={20} />
                                                    <Text style={[groupMapStyle.calloutRowText, mainStyle.fontmd]}>{(device.battery * 100).toFixed(0)}%</Text>
                                                </View>
                                            </View>

                                            <View style={groupMapStyle.calloutRow}>
                                                <Icon name='clock' type='font-awesome' size={20} color={Colors.gray} />
                                                <Text style={[groupMapStyle.calloutRowText, mainStyle.fontmd]}>{moment(device.event_timestamp).format('DD MMM YYYY, h:mm A')}</Text>
                                            </View>
                                            <View style={groupMapStyle.calloutRow}>
                                                <Icon name='map-marker' type='font-awesome' size={20} color={Colors.gray} />
                                                <Text style={[groupMapStyle.calloutRowText, mainStyle.fontmd]}>{device.current_address || "Not Available"}</Text>
                                            </View>
                                        </View>
                                    </Callout>
                                </Marker.Animated>
                            );
                        })
                    }
                    {
                        currentLocation &&
                        <Marker
                            key="cl"
                            identifier="cl"
                            coordinate={{
                                latitude: currentLocation.latitude,
                                longitude: currentLocation.longitude,
                            }}
                            title="Your Location"
                        >
                            <Image source={Icons.idle} />
                            <Callout>
                                <View style={groupMapStyle.callout}>
                                    <Text style={[groupMapStyle.calloutHeader, mainStyle.fontbl]}>Current Location</Text>
                                </View>
                            </Callout>
                        </Marker>
                    }

                    {/* {
                        Object.keys(trackingDevices).map((deviceNumber) => {

                            let routeCoordinates = Object.values(trackingDevices[deviceNumber]);

                            return (
                                <Polyline
                                    key={"route" + deviceNumber}
                                    strokeColor={routeColors[deviceNumber]} // fallback for when `strokeColors` is not supported by the map-provider
                                    coordinates={routeCoordinates}
                                    strokeColors={[
                                        '#7F0000',
                                        '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
                                        '#B24112',
                                        '#E5845C',
                                        '#238C23',
                                        '#7F0000'
                                    ]}
                                    strokeWidth={5}
                                />
                            )
                        })
                    } */}
                </MapView>


                <View style={styles.vwHeader}>
                    <TouchableOpacity activeOpacity={0.45} style={[styles.btnHeader, { marginLeft: 0, }]}
                        onPress={() => { this.props.navigation.goBack() }}>
                        <Icon name={'chevron-left'} size={35} color={Colors.black} />
                    </TouchableOpacity>
                    <View style={styles.vwHeaderRight}>
                        {/* <TouchableOpacity activeOpacity={0.45} style={styles.btnHeader}>
                            <Icon name={'filter-variant'} size={25} color={Colors.black} />
                        </TouchableOpacity> */}
                        <TouchableOpacity activeOpacity={0.45} style={styles.btnHeader}
                            onPress={() => { this.setState({ modelSetting: true }) }}>
                            <Icon name={'cog-outline'} size={25} color={Colors.black} />
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.options}>
                    <TouchableOpacity activeOpacity={0.45}
                        style={styles.option}
                        onPress={() => this.toggleMapType()}
                    >
                        <Icon name={'layers'} size={30} color={Colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={groupMapStyle.option} onPress={() => this.fitToMarkersToMap()}>
                        <Icon name='refresh' type='font-awesome' color={Colors.white} size={25} />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity activeOpacity={0.70} style={styles.vwBottom}
                    onPress={() => { this.setState({ modelMembers: true }) }}>
                    <View style={styles.vwBottomChild}>

                        <View style={{
                        }}>
                            <Text style={styles.txtBottomLabel}>{itemData.name} ({itemData.users.length})</Text>
                            <Text style={styles.txtBottom}>All Time Tracking</Text>
                        </View>
                        <View style={styles.vwHeaderRight}>
                            <TouchableOpacity activeOpacity={0.45} style={styles.btnHeader}>
                                <Icon name={'map-marker-check'} size={25} color={Colors.black} />
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.45} style={styles.btnHeader}>
                                <Icon name={'map-marker-radius'} size={25} color={Colors.black} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
                <Modal
                    animationType='slide'
                    supportedOrientations={['portrait', 'landscape']}
                    transparent={true}
                    visible={modelMembers}
                    onRequestClose={() => { this.setState({ modelMembers: false }) }}>
                    <View style={styles.vwModel}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, }}>
                            <TouchableOpacity activeOpacity={0.45} style={[styles.btnHeader, { marginRight: 10, }]}
                                onPress={() => { this.setState({ modelMembers: false }) }}>
                                <Icon name={'chevron-down'} size={30} color={Colors.black} />
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.txtBottomLabel}>{itemData.name} ({itemData.users.length})</Text>
                                <Text style={styles.txtBottom}>All Time Tracking</Text>
                            </View>
                            {/* <View style={styles.vwHeaderRight}>
                                <TouchableOpacity activeOpacity={0.45} style={styles.btnHeader}>
                                    <Icon name={'map-marker-check'} size={25} color={Colors.black} />
                                </TouchableOpacity>
                                <TouchableOpacity activeOpacity={0.45} style={styles.btnHeader}>
                                    <Icon name={'map-marker-radius'} size={25} color={Colors.black} />
                                </TouchableOpacity>
                            </View> */}
                        </View>
                        {itemData.users.length > 0 &&
                            <FlatList
                                style={{ marginTop: 5 }}
                                data={itemData.users}
                                // refreshing={refreshing}
                                // onRefresh={() => this.getReport()}
                                // keyExtractor={item => item._id.toString()}
                                contentContainerStyle={{ paddingBottom: 40 }}
                                renderItem={({ item, index }) => {
                                    return (
                                        <TouchableOpacity activeOpacity={0.70}
                                            onPress={() => this.openUser(item)}
                                            style={styles.vwList}>
                                            <View style={{ flex: 2 }}>
                                                <View style={{
                                                    marginLeft: 9,
                                                    justifyContent: 'center', alignItems: 'center',
                                                    height: 60, width: 60, borderRadius: 50,
                                                    backgroundColor: Colors.yellow
                                                }}>
                                                    <Text style={[styles.txtListLabel, { color: "#FFF", fontSize: 20 }]}>{item.profile_name.slice(0, 1)}</Text>
                                                    {/* <Image source={{ uri: item.url }} resizeMode="contain" style={{ height: 50, width: 50, }} /> */}
                                                </View>
                                                <View style={{
                                                    bottom: 15,
                                                    justifyContent: 'center', alignItems: 'center',
                                                    height: 20, width: 80, borderRadius: 25,
                                                    backgroundColor: Colors.black, flexDirection: 'row'
                                                }}>
                                                    <Icon name='battery' color={Colors.white} size={20} style={{ transform: [{ rotate: '90deg' }], position: 'absolute', left: 10 }} />
                                                    <Text style={[styles.txtListLabel, { color: "#FFF", fontSize: 14, left: 15 }]}>{(item.battery * 100).toFixed(0)}%</Text>
                                                </View>
                                            </View>
                                            <View style={{ flex: 8, marginLeft: 10, marginTop: 10, width: '100%', }}>
                                                <View style={{ marginLeft: 5 }}>
                                                    <Text style={styles.txtListLabel}>{item.profile_name}</Text>
                                                    <Text style={[styles.txtListLabel, {
                                                        fontSize: 14,
                                                        fontWeight: 'normal', color: 'red'
                                                    }]}>GPS Turned {item.gps_status}</Text>
                                                    <Text style={[styles.txtListLabel, {
                                                        fontSize: 14,
                                                        fontWeight: 'normal', color: '#333'
                                                    }]}>{moment(item.event_timestamp).format('DD MMM YYYY, h:mm A')}</Text>
                                                </View>
                                                {item._id != itemData.created_by._id &&
                                                    <TouchableOpacity
                                                        onPress={() => this.removeMember(item)}
                                                        style={{ flex: 2, alignItems: 'flex-end' }}>
                                                        <Icon name={'trash-can-outline'} size={25} color={Colors.red} />
                                                    </TouchableOpacity>
                                                }
                                            </View>
                                        </TouchableOpacity>
                                    )
                                }} />
                        }
                        <TouchableOpacity activeOpacity={0.70}
                            onPress={() => { this.addMember(itemData) }}
                            style={styles.btnModel}>
                            <Text style={styles.txtModelButton}>Add New Member</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
                <Modal
                    animationType='slide'
                    supportedOrientations={['portrait', 'landscape']}
                    transparent={true}
                    visible={modelSetting}
                    onRequestClose={() => { this.setState({ modelSetting: false }) }}>
                    <View style={styles.vwModel}>
                        <View style={styles.vwHeaderChild}>
                            <View>
                                <Text style={styles.txtBottomLabel, { fontSize: 20, fontWeight: 'bold' }}>Manage {circleName}</Text>
                            </View>
                            <View style={styles.vwHeaderRight}>
                            </View>
                        </View>
                        {/* <View style={styles.vwHeaderChild}>
                            <View style={{
                            }}>
                                <Text style={styles.txtBottomLabel}>Edit Circle Information</Text>
                            </View>
                            <View style={styles.vwHeaderRight}>
                            </View>
                        </View> */}
                        <View style={styles.vwSettingRowCard}>
                            <View>
                                <Text style={styles.txtBottom}>Circle Name</Text>
                            </View>
                            <View style={styles.vwHeaderRight}>
                                <TextInput
                                    style={{
                                        paddingHorizontal: 10,
                                        width: '60%',
                                        height: h(5),
                                        alignItems: 'center',
                                        textAlign: "right",
                                        borderRadius: 10,
                                        // paddingVertical: 1,
                                        backgroundColor: Colors.lightGray
                                    }}
                                    value={circleName}
                                    placeholder="Circle Name"
                                    underlineColorAndroid='transparent'
                                    keyboardType='default'
                                    returnKeyType="done"
                                    onChangeText={(value) => this.setState({ circleName: value })}
                                />
                            </View>
                        </View>
                        <View style={[styles.vwSettingRowCard, { marginTop: 3 }]}>
                            <View>
                                <Text style={styles.txtBottom}>Admin</Text>
                            </View>
                            <View style={styles.vwHeaderRight}>
                                <Text style={[styles.txtBottom, { color: Colors.yellow }]}>{itemData.created_by.profile_name}</Text>
                            </View>
                        </View>
                        <View style={[styles.vwSettingRowCard, { marginTop: 3 }]}>
                            <View>
                                <Text style={styles.txtBottom}>Subscription Expiry</Text>
                            </View>
                            <View style={styles.vwHeaderRight}>
                                <Text style={styles.txtBottom, { color: Colors.red, marginRight: 10 }}>{moment(this.state.expiry_date).format('DD-MMM-YYYY')}</Text>
                                {
                                    moment() >= moment(this.state.expiry_date) ?
                                        (<TouchableOpacity onPress={() => NavigationService.navigate('homeStack', 'CirclePackages')}>
                                            <View style={[deviceStyle.rightButton, { backgroundColor: Colors.blue }]}>
                                                <Text style={[mainStyle.whiteText, mainStyle.fontmd, mainStyle.textlg]}>Renew</Text>
                                            </View>
                                        </TouchableOpacity>)
                                        : (<View></View>)}
                            </View>
                        </View>
                        <View style={[styles.vwSettingRowCard, { marginTop: 3 }]}>
                            <View>
                                <Text style={styles.txtBottom}>Location Sharing</Text>
                            </View>
                            <View style={styles.vwHeaderRight}>
                                <Switch onValueChange={this.onPressActive} value={IsActive}
                                    trackColor={{ false: Colors.lightGray, true: Colors.blue }}
                                    thumbColor={IsActive ? Colors.yellow : Colors.white}
                                    ios_backgroundColor={Colors.darkGray} />
                            </View>
                        </View>
                        <TouchableOpacity activeOpacity={0.70}
                            onPress={() => { this.setState({ modelSetting: false }), this.updateCircle(itemData) }}
                            style={[styles.btnModel, { marginTop: 55 }]}>
                            <Text style={styles.txtModelButton}>Update</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.70}
                            onPress={() => { this.setState({ modelSetting: false }), this.addMember(itemData) }}
                            style={[styles.btnModel, { marginTop: 55 }]}>
                            <Text style={styles.txtModelButton}>Add New Member</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.70}
                            onPress={() => { this.deleteCircle() }}
                            style={[styles.btnModel, { backgroundColor: Colors.noColor }]}>
                            <Text style={[styles.txtModelButton, { color: Colors.red, textDecorationLine: 'underline' }]}>Delete This Circle</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
            </View >
        );
    };
    mapMarkers = () => {
        let { navigation } = this.props, circle_users = navigation.getParam('circle_users', null);
        return circle_users.map((marker, i) => <MapView.Marker key={i}
            coordinate={marker.coordinates}
            title={marker.title}
        // description={report.comments}
        >
        </MapView.Marker >)
    }
}