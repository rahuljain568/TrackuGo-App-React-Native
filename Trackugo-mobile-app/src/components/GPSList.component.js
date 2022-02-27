import React, { Component } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView, FlatList, Dimensions, Modal, TextInput, ToastAndroid, Alert } from 'react-native';
import DeleteIcon from 'react-native-vector-icons/MaterialIcons';
import { Input } from 'react-native-elements'
import SearchIcon from 'react-native-vector-icons/AntDesign'
import PlusIcon from 'react-native-vector-icons/Entypo'
import LocationIcon from 'react-native-vector-icons/Entypo'
import RightIcon from 'react-native-vector-icons/AntDesign'
import BarIcon from "react-native-vector-icons/Octicons"
import BackIcon from "react-native-vector-icons/Entypo"
import NoteIcon from 'react-native-vector-icons/SimpleLineIcons'
import CarIcon from 'react-native-vector-icons/FontAwesome5'
import { Icon } from 'react-native-elements';
import Colors from '../modules/colors.module';
import mainStyle from '../styles/main.style';
import moment from 'moment';
import StorageService from '../services/storage.service';

import UriConfig from "../config/uri.config";

import ApiService from "../services/api.service";
import GeneralService from "../services/general.service";
import NavigationService from "../services/navigation.service";
import Loader from "../modules/loader.module";
import MapView, { Marker, Polygon } from "react-native-maps";
import geofenceStyle from "../styles/geofence.style";
import ButtonComponent from "./partials/Button.component";
import AppConfig from '../config/app.config';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

let timeout;

const RoundCar = () => {
    return (
        <View style={{ flexDirection: 'row' }}>
            <View style={styles.round}>
                {/* <LocationIcon name="location" size={19} color="#cccccc" /> */}
                <Icon name="location-outline" type="ionicon" size={24} color="gray" />
            </View>
            {/* <View style={styles.dot} /> */}
        </View>
    )
}

const phw = Dimensions.get('window').width;
export default class GPSListComponent extends Component { 
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

            device: null,
            loading: false,
            refreshing: true,
            geoFencing: [],
        };
    }

    componentDidMount() {
        let { navigation } = this.props,
            device = navigation.getParam("device", null);
        this.props.navigation.setParams({ device: device });

        this.props.navigation.addListener("didFocus", (payload) => {
            this.setState(
                {
                    device: device,
                },
                () => {
                    this.getGeoFencing(1);
                }
            );
        });
    }

    getGeoFencing = async (page) => {
        let device_ = await StorageService.fetch('device_info');
        let device = JSON.parse(device_);


        this.setState({ refreshing: true });

        if (!page) {
            this.setState({ geoFencing: [] });
        }
        // let { device } = this.state;
        // console.log('device', device);
        // console.log('page', page);

        await ApiService.call(
            "get",
            UriConfig.uri.GEO_FENCING +
            // (device ? "?id=" + device.id : "") +
            // (device ? "/" + device.id : "") +
            // (device ? "/" + device._id : "") +
            (page ? "?page=" + page : ""),
            {},
            async (content) => {
                console.log('content', content);
                let geoFencing = content.geoFencing;
                //  console.log('geoFencing',geoFencing);
                this.setState({
                    refreshing: false,
                    nextPage: geoFencing.nextPage,
                    geoFencing: [...this.state.geoFencing, ...geoFencing.items],
                });
                // console.log('geoFencing', this.state.geoFencing);
                // console.log('device', this.state.geoFencing[0].device);

            },
            (error, errors, content) => {
                this.setState({ refreshing: false });
            }
        );
    };

    nextPageGeoFencing = () => {
        let { page, nextPage } = this.state;
        console.log(nextPage, 'nextPage');
        if (nextPage && nextPage !== page) {
            this.setState({ page: nextPage }, () => {
                this.getGeoFencing(nextPage);
            });
        }
    };
    render() {
        let { device } = this.state;
        return (
            <View style={{ backgroundColor: Colors.theme.lightBackgroundColor, flex: 1 }}>
                {/* <View style={styles.header}>
                    <BackIcon name="chevron-left" size={30} color='#f2f2f2' style={{ marginLeft: 10 }} />
                    <View style={styles.headerTextBox}>
                        <Text style={{ fontSize: 22, color: '#f2f2f2', fontWeight: 'bold' }}>Geo Fence</Text>
                    </View>
                </View> */}
                <View style={styles.header2}>
                    <Input
                        placeholder='Search by name'
                        placeholderTextColor="#b3b3b3"
                        style={{ fontSize: 16 }}
                        inputContainerStyle={styles.searchStyle}
                        leftIcon={<Icon name="search" type="font-awesome" size={22} color="gray" />}
                    />
                </View>

                <FlatList
                    data={this.state.geoFencing}
                    refreshing={this.state.refreshing}
                    showsVerticalScrollIndicator={false}
                    onRefresh={() => this.getGeoFencing()}
                    keyExtractor={(item, index) => item._id}
                    onEndReached={() => this.nextPageGeoFencing()}
                    ListEmptyComponent={this.renderEmptyContainer()}
                    renderItem={({ item, index, separators }) => {
                        return (
                            <View style={{ marginTop: 10 }}>
                                <TouchableOpacity
                                    style={styles.mainBox}
                                    onPress={() => NavigationService.navigate("homeStack", "GeoFenceAll", { device: item.device, id: item._id, itemData: item })}>
                                    <View style={{ paddingLeft: 10, flexDirection: 'row', alignItems: 'center', width: '100%', paddingVertical: 5 }}>
                                        <RoundCar />
                                        <View style={{ marginVertical: 2, width: '85%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <View style={{ flex: 7 }}>
                                                <Text style={{ fontSize: 16, marginLeft: 10, fontWeight: 'bold' }}>{item.remarks || "Not Available"}</Text>
                                                <Text style={{ color: '#a6a6a6', fontSize: 13, marginLeft: 10, marginTop: 5 }}>{moment(item.created_at).format('DD MMM YYYY hh:mm a')}</Text>
                                            </View>
                                            <View style={{ flex: 3, justifyContent: 'flex-end', paddingRight: 10 }}>
                                                <View style={styles.textback}>
                                                    {item.device && item.type == "Single Device" &&
                                                        <Text style={{ color: '#a6a6a6', fontSize: 13, }}>{item.device[0].license_plate}</Text>
                                                    }
                                                    {item.type == "All Devices" &&
                                                        <Text style={{ color: '#a6a6a6', fontSize: 13, }}>All Devices</Text>
                                                    }
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    <View style={{ width: '10%', marginBottom: 25 }}>
                                        {/* <TouchableOpacity style={{ marginVertical: 0 }}>
                                            <DeleteIcon name="delete" size={22} color='#b3b3b3' />
                                        </TouchableOpacity> */}
                                        {/* <TouchableOpacity style={{ marginVertical: 8 }}
                                            // onPress={() => NavigationService.navigate("homeStack", "GeoFence", { device: item.device })}>
                                            onPress={() => NavigationService.navigate("homeStack", "GeoFenceAll", { device: item.device, id: item._id, itemData: item })}>
                                            <RightIcon name="right" size={28} color="#b3b3b3" />
                                        </TouchableOpacity> */}
                                        {/* <TouchableOpacity style={styles.viewButton}
                                            onPress={() => NavigationService.navigate("homeStack", "GeoFence", { device: item.device, id: item._id, })}>
                                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>View</Text>
                                            <BackIcon name="chevron-right" size={22} color="#fff" style={{ marginLeft: -4 }} />
                                        </TouchableOpacity> */}
                                    </View>
                                </TouchableOpacity>
                            </View>
                        )
                    }} />

                <TouchableOpacity style={styles.bottomButton}
                    onPress={() =>
                        NavigationService.navigate("homeStack", "GeoFenceAll", {
                            // device: item.device, id: item._id, itemData: item
                            id: ""
                        })
                    }>
                    <PlusIcon name="plus" size={24} color="#fff" />
                </TouchableOpacity>

            </View>
        )
    }

    renderEmptyContainer() {
        return (
            <View style={mainStyle.itemsCenter}>
                <Text style={mainStyle.fontrg}>
                    {this.state.refreshing
                        ? "Fetching geo fences..."
                        : "No geo fence saved."}
                </Text>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    mainBox: {
        // paddingVertical: 0,
        // borderWidth: .8,
        width: '95%',
        marginLeft: '2.5%',
        borderRadius: 5,
        // borderColor: '#e6e6e6',
        flexDirection: 'row',
        backgroundColor: 'white',
        elevation: 2
    },
    eachBox: {
        marginHorizontal: 5,
        paddingHorizontal: 10,
        borderBottomWidth: 1.5,
        borderColor: '#b3b3b3',
        borderRadius: 5,
        // height: '85'
    },
    header2: {
        // backgroundColor: '#fff',
        paddingTop: 10,
        // marginHorizontal: -5
    },
    searchStyle: {
        borderWidth: 0.8,
        // borderBottomWidth: 1.4,
        // paddingHorizontal: 5,
        width: '100%',
        // marginBottom: -24,
        height: 42,
        borderColor: '#ccc',
        backgroundColor: 'white'
    },
    viewButton: {
        backgroundColor: '#ff8c1a',
        paddingLeft: 5,
        paddingRight: 0,
        borderRadius: 5,
        flexDirection: 'row',
        marginLeft: -15,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomButton: {
        bottom: 0,
        position: 'absolute',
        backgroundColor: '#ff8c1a',
        padding: 15,
        borderRadius: 100,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        marginLeft: phw - 80,
        marginBottom: 35
    },
    header: {
        height: 70,
        backgroundColor: '#595959',
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerTextBox: {
        marginLeft: 15
    },
    round: {
        borderWidth: 1.5,
        padding: 6,
        borderRadius: 20,
        borderColor: '#cccccc',
    },
    dot: {
        height: 7,
        width: 7,
        backgroundColor: '#00b300',
        borderRadius: 10,
        marginLeft: -7,
        marginTop: 3
    },
    textback: {
        backgroundColor: '#f2f2f2',
        paddingVertical: 2,
        paddingHorizontal: 5,
        marginRight: 5,
        borderRadius: 15,
        height: 28,
        justifyContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        width: 110
    }
})

export class GeoFenceAllComponent extends Component {
    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};

        return {
            headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
            ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
            headerTitle: (
                <Text style={mainStyle.mainTitle}>
                    {params.device ? params.device.license_plate : "Geofence"}
                </Text>
            ),
            headerRight: (
                <TouchableOpacity
                    style={mainStyle.pad10}
                    onPress={() => (params ? params.modalState(true) : null)}
                >
                    <Icon
                        name="check"
                        type="font-awesome"
                        size={30}
                        color={Colors.gray}
                    />
                </TouchableOpacity>
            ),
        };
    };

    constructor() {
        super();

        let { latitudeDelta, longitudeDelta } = GeneralService.locationDelta(0.005);
        let { latitude, longitude } = GeneralService.defaultLocation(0.005);
        // let position = GeneralService.currentLocation();

        this.state = {
            id: "",
            device: null,
            loading: true,
            isModalVisible: false,
            type: "circle",
            geoFence: null,
            location: null,
            coordinates: [],
            region: {
                latitude: latitude,
                longitude: longitude,
                latitudeDelta: latitudeDelta,
                longitudeDelta: longitudeDelta,
            },
            mapType: "standard",
            values: [],
            editing: false,
            user: null
        };
    }

    async componentDidMount() {
        let { navigation } = this.props,
            id = navigation.getParam("id", null),
            device = navigation.getParam("device", null);
        this.props.navigation.setParams({
            device: device,
            modalState: this.modalState,
        });
        let user = JSON.parse(await StorageService.fetch('user'));

        this.setState(
            {
                user: user,
                id: id,
                device: device,
            },
            () => {
                this.getGeofence(device);
            }
        );
    }

    getGeofence = (device) => {
        let itemData = this.props.navigation.getParam("itemData", null);
        if (itemData != null) {
            console.log('itemData22', itemData);
            if (itemData.location) {
                let tmpLet = itemData.location.coordinates[1], tmpLong = itemData.location.coordinates[0];

                coordinate = {
                    latitude: tmpLet, longitude: tmpLong,
                };
                this.setState({
                    type: "circle", location: coordinate,
                    values: {
                        remarks: itemData.remarks, notify_when: itemData.notify_when,
                        geoFence: itemData,
                    },
                });
                if (coordinate) {
                    this.centerMap(
                        coordinate.latitude,
                        coordinate.longitude,
                        itemData.latitude_delta,
                        itemData.longitude_delta,
                    );
                }
            } else {
                ToastAndroid.show("Location not available", ToastAndroid.LONG);
            }
        }
        this.setState({ loading: false });
        return;




        let { id } = this.state;
        if (!id) {
            if (device.location) {
                this.centerMap(
                    device.location.coordinates[1],
                    device.location.coordinates[0]
                );
            }

            return this.setState({ loading: false });
        }

        ApiService.call(
            "get",
            UriConfig.uri.GEO_FENCE_DETAILS +
            "/" + device._id,
            {},
            (content) => {
                let geoFence = content.geoFence,
                    coordinate = null;

                if (geoFence) {
                    if (geoFence.coordinates) {
                        let coordinates = this.parseCoordinates(geoFence);

                        this.setState({
                            type: "polygon",
                            coordinates: coordinates,
                        });

                        coordinate = {
                            latitude: coordinates[0].latitude,
                            longitude: coordinates[0].longitude,
                        };
                    } else {
                        let coordinates = geoFence.location.coordinates;

                        coordinate = {
                            latitude: coordinates[1],
                            longitude: coordinates[0],
                        };

                        this.setState({
                            type: "circle",
                            location: coordinate,
                        });
                    }

                    this.setState({
                        values: {
                            remarks: geoFence.remarks,
                            notify_when: geoFence.notify_when,
                        },
                    });

                    if (coordinate) {
                        this.centerMap(
                            coordinate.latitude,
                            coordinate.longitude,
                            geoFence.latitude_delta,
                            geoFence.longitude_delta
                        );
                    }
                }

                this.setState({
                    loading: false,
                    geoFence: geoFence,
                });
            },
            (error, errors, content) => {
                this.setState({ loading: false });
            }
        );
    };

    centerMap = (latitude, longitude, latitudeDelta, longitudeDelta) => {
        let { region } = this.state;
        setTimeout(() => {
            this._map.animateToRegion({
                latitude: latitude,
                longitude: longitude,
                latitudeDelta: latitudeDelta || region.latitudeDelta,
                longitudeDelta: longitudeDelta || region.longitudeDelta,
            });
        }, 2000);
    };

    parseCoordinates = (geoFence) => {
        let coordinates = [];
        for (let coordinate of geoFence.coordinates.coordinates[0]) {
            coordinates.push({ latitude: coordinate[1], longitude: coordinate[0] });
        }

        return coordinates;
    };

    modalState = (bool) => {
        this.setState({ isModalVisible: bool });
    };

    changeInput = (value, name) => {
        this.setState({ values: { ...this.state.values, [name]: value } });
    };

    saveGeofence = () => {
        try {
            console.log("Geofencing Params", device)
            let {
                geoFence,
                values,
                device,
                coordinates,
                type,
                location,
                id,
                region,
                user
            } = this.state;
            let params = {
                remarks: values.remarks,
                notify_when: values.notify_when || "ARRIVAL",
            };

            if (type == "circle") {
                if (!location) {
                    return alert("Please draw fencing properly.");
                }

                // params.location = location;
            } else if (type == "polygon") {
                if (coordinates.length < 3) {
                    return alert("Please draw fencing properly.");
                }

                // params.coordinates = coordinates;
            } else {
                return alert("Data not valid.");
            }

            params.latitude_delta = region.latitudeDelta;
            params.longitude_delta = region.longitudeDelta;
            params.location = {
                latitude: region.latitude,
                longitude: region.longitude
            };
            params.user_id = user._id;
            params.type = "All Devices";
            console.log("Geofencing Params", params)
            this.setState({ loading: true });
            ApiService.call(id ? "put" : "post", UriConfig.uri.GEO_FENCE_SAVE + "/" + id, params,
                (content, status) => {
                    this.setState({
                        loading: false,
                        editing: false,
                        isModalVisible: false,
                    });
                    console.log(content);
                    ToastAndroid.show(status.message, ToastAndroid.SHORT);

                    // NavigationService.navigate("homeStack", "GeoFencing", {
                    //     device: device,
                    // });
                },
                (error, errors, content) => {
                    this.setState({ loading: false });
                    GeneralService.placeErrors(this, errors);
                }
            );
        } catch (error) {
            console.log(error);
            this.setState({ loading: false });
        }
    };

    regionChange = (region) => {
        console.log('region', region);
        this.setState({
            region: {
                // ...this.state.region,
                latitude: region.latitude,
                longitude: region.longitude,
                longitudeDelta: region.longitudeDelta,
                latitudeDelta: region.latitudeDelta,
            },
            location: region,
        });
    };

    onPress(e) {
        if (this.state.editing) {
            if (this.state.type == "circle") {
                this.setState({ location: e.nativeEvent.coordinate });
            } else {
                this.setState({
                    coordinates: [...this.state.coordinates, e.nativeEvent.coordinate],
                });
            }
        }
    }

    toggleMapType = () => {
        this.setState({
            mapType: this.state.mapType === "satellite" ? "standard" : "satellite",
        });
    };

    drawCoordinates = () => {
        this.setState({
            editing: true,
            location: null,
            coordinates: [],
        });
    };

    resetCoordinates = () => {
        let { geoFence } = this.state;

        this.setState({ editing: false });
        if (geoFence.coordinates == null) {
            return;
        }
        if (!geoFence) {
            return this.setState({
                type: "circle",
                location: null,
                coordinates: [],
            });
        }

        if (geoFence.coordinates) {
            this.setState({
                type: "polygon",
                coordinates: this.parseCoordinates(geoFence),
            });
        } else {
            let coordinates = geoFence.location.coordinates;

            this.setState({
                type: "circle",
                location: {
                    latitude: coordinates[1],
                    longitude: coordinates[0],
                },
            });
        }
    };

    drawPatternChange = () => {
        this.setState({ type: this.state.type == "circle" ? "polygon" : "circle" });
    };

    deleteGeoFence(id) {
        Alert.alert(
            "Confirmation",
            "Are you sure to delete geo fence?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "OK",
                    onPress: () => {
                        this.setState({ loading: true });

                        ApiService.call(
                            "delete",
                            UriConfig.uri.GEO_FENCE_DELETE + "/" + id,
                            {},
                            async (content, status) => {
                                this.setState({ loading: false });

                                ToastAndroid.show(status.message, ToastAndroid.SHORT);

                                NavigationService.navigate("homeStack", "GPSList", {
                                    device: this.state.device,
                                });
                            },
                            (error, errors, content) => {
                                this.setState({ loading: false });
                            }
                        );
                    },
                },
            ],
            { cancelable: true }
        );
    }

    render() {
        const {
            geoFence,
            region,
            loading,
            isModalVisible,
            values,
            type,
            location,
            coordinates,
            mapType,
            editing,
        } = this.state;

        let notifyWhen = values.notify_when || "ARRIVAL";
        console.log('region', region);
        let itemData = this.props.navigation.getParam("itemData", null);
        return (
            <View style={mainStyle.map}>
                <Loader loading={loading} />
                <MapView
                    mapType={mapType}
                    style={mainStyle.map}
                    ref={(ref) => (this._map = ref)}
                    initialRegion={region}
                    zoomControlEnabled
                    onPress={(e) => this.onPress(e)}
                    onRegionChangeComplete={this.regionChange}
                >
                    {coordinates.length > 0 && (
                        <Polygon
                            key="polygon"
                            strokeWidth={1}
                            strokeColor="#F00"
                            coordinates={coordinates}
                            fillColor="rgba(255,0,0,0.5)"
                        />
                    )}
                    {location && (
                        <MapView.Circle
                            center={location}
                            radius={200}
                            strokeWidth={1}
                            strokeColor={"#1a66ff"}
                            fillColor={"rgba(230,238,255,0.5)"}
                        />
                    )}
                </MapView>

                {/* <View style={geofenceStyle.center}>
            <View style={geofenceStyle.circle} />
            <Image style={geofenceStyle.centerIcon} source={Icons.idle} />
          </View> */}

                {editing && type && (
                    <View style={geofenceStyle.optionsh}>
                        <TouchableOpacity
                            style={geofenceStyle.option}
                            onPress={() => this.drawPatternChange()}
                        >
                            {type == "circle" && (
                                <Icon
                                    name="circle-o"
                                    type="font-awesome"
                                    color={Colors.white}
                                    size={30}
                                />
                            )}

                            {type == "polygon" && (
                                <Icon
                                    name="square-o"
                                    type="font-awesome"
                                    color={Colors.white}
                                    size={30}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                )}

                <View style={geofenceStyle.options}>
                    <TouchableOpacity
                        style={geofenceStyle.option}
                        onPress={() => this.toggleMapType()}
                    >
                        <Icon
                            name="layers"
                            type="font-awesome-5"
                            color={Colors.white}
                            size={30}
                        />
                    </TouchableOpacity>

                    {itemData && (
                        <TouchableOpacity
                            style={geofenceStyle.option}
                            onPress={() => this.deleteGeoFence(itemData._id)}
                        >
                            <Icon
                                name="trash"
                                type="font-awesome"
                                color={Colors.white}
                                size={30}
                            />
                        </TouchableOpacity>
                    )}

                    {!editing && (
                        <TouchableOpacity
                            style={geofenceStyle.option}
                            onPress={() => this.drawCoordinates()}
                        >
                            <Icon
                                name="pencil"
                                type="font-awesome"
                                color={Colors.white}
                                size={30}
                            />
                        </TouchableOpacity>
                    )}

                    {editing && (
                        <TouchableOpacity
                            style={geofenceStyle.option}
                            onPress={() => this.resetCoordinates()}
                        >
                            <Icon
                                name="times"
                                type="font-awesome"
                                color={Colors.white}
                                size={30}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                <Modal
                    transparent={true}
                    animationType={"none"}
                    onRequestClose={() => this.modalState(false)}
                    visible={isModalVisible}
                >
                    <View style={mainStyle.modalBackground}>
                        <View style={mainStyle.modalForm}>
                            <View style={mainStyle.formBody}>
                                <Text
                                    style={[
                                        mainStyle.textxl,
                                        mainStyle.marginBottom10,
                                        mainStyle.fontmd,
                                        mainStyle.whiteText,
                                    ]}
                                >
                                    Geo Fence
                                </Text>

                                <View style={geofenceStyle.radioView}>
                                    <Text
                                        style={[
                                            geofenceStyle.radioBox,
                                            mainStyle.fontmd,
                                            mainStyle.textnm,
                                            notifyWhen == "ARRIVAL"
                                                ? geofenceStyle.radioBoxSelected
                                                : null,
                                        ]}
                                        onPress={() => this.changeInput("ARRIVAL", "notify_when")}
                                    >
                                        ARRIVAL
                                    </Text>
                                    <Text
                                        style={[
                                            geofenceStyle.radioBox,
                                            mainStyle.fontmd,
                                            mainStyle.textnm,
                                            notifyWhen == "LEFT"
                                                ? geofenceStyle.radioBoxSelected
                                                : null,
                                        ]}
                                        onPress={() => this.changeInput("LEFT", "notify_when")}
                                    >
                                        LEFT
                                    </Text>
                                    <Text
                                        style={[
                                            geofenceStyle.radioBox,
                                            mainStyle.fontmd,
                                            mainStyle.textnm,
                                            notifyWhen == "BOTH"
                                                ? geofenceStyle.radioBoxSelected
                                                : null,
                                        ]}
                                        onPress={() => this.changeInput("BOTH", "notify_when")}
                                    >
                                        BOTH
                                    </Text>
                                </View>

                                <View style={mainStyle.formInput}>
                                    <TextInput
                                        style={[mainStyle.formInputField, mainStyle.whiteText]}
                                        value={values.remarks || ""}
                                        onChangeText={(value) => this.changeInput(value, "remarks")}
                                        placeholder="Remarks (Optional)"
                                        placeholderTextColor={Colors.theme.lightText}
                                    />
                                </View>

                                <ButtonComponent
                                    text="Save"
                                    onClick={this.saveGeofence.bind(this)}
                                />
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        );
    }
}