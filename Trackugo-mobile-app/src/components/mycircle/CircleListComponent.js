import React from 'react';
import {
    Text, View,
    StyleSheet, TouchableOpacity, FlatList, ScrollView,
    TextInput,
    SafeAreaView,
    Alert,
    Modal, ToastAndroid
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RightIcon from 'react-native-vector-icons/AntDesign'
import Colors from '../../modules/colors.module';
import mainStyle from '../../styles/main.style';
import moment from 'moment';
import UriConfig from '../../config/uri.config';
import Loader from '../../modules/loader.module';
import NavigationService from '../../services/navigation.service';
import ApiService from '../../services/api.service';
import StorageService from '../../services/storage.service';
import GeneralService from '../../services/general.service';
import Geolocation from '@react-native-community/geolocation';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class CircleList extends React.Component {
    static navigationOptions = ({ navigation }) => {
        // let params = navigation.state.params || {};
        // let device = params.device || null;
        return {
            headerLeft: <TouchableOpacity style={{ paddingLeft: 10 }} onPress={() => { navigation.goBack() }}
            ><MaterialIcon name={'chevron-left'} size={35} color='#ffffff' /></TouchableOpacity>,
            headerTitle: (
                <View>
                    <Text style={mainStyle.titleTextMain}>My Circle</Text>
                    {/* <Text style={mainStyle.titleTextSub}>{device ? device.license_plate : null}</Text> */}
                </View>
            )
        };
    };
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false, refreshing: false,
            circle: [], modelCreate: false, modelCreateCircle: false,
            inputValue: "", headerLabel: "", inputLabel: "", placeholder: "",
        };
        this.reRenderSomething = this.props.navigation.addListener('willFocus', () => {
            this.getCircle();
            this.ValidatePackage();
        });
    }
async ValidatePackage()
{
    let circle_expiry_date = JSON.parse(await StorageService.fetch('circle_expiry_date'));
    console.log(circle_expiry_date, 'circle_expiry_date123');

    // let expiry_date = moment('2022-01-15');
    // console.log(moment().format('YYYY-MM-DD'),'moment');
    console.log(circle_expiry_date == null || moment().format('YYYY-MM-DD') >= moment(circle_expiry_date).format('YYYY-MM-DD'))
    
    if (circle_expiry_date == null || moment().format('YYYY-MM-DD') >= moment(circle_expiry_date).format('YYYY-MM-DD')) {
      this.props.navigation.replace('CirclePackages');
    }
    
}
   async componentDidMount() {
        try {
            // this.ValidatePackage();
            let user = JSON.parse(await StorageService.fetch('user'));
            // // let expiry_date = (user.circle_subscriptions.length > 0) ? user.circle_subscriptions[0].expiry_date : null;
            // let expiry_date = null;
            // // console.log(expiry_date,'expiry_date11');
            // if (expiry_date == null || moment() >= this.state.expiry_date) {
            //     NavigationService.navigate('homeStack', 'CirclePackage')
            // }
            let { navigation } = this.props, circleCode = navigation.getParam('circleCode', null);
            if (circleCode != null) {
                this.setState({
                    modelCreate: false, modelCreateCircle: true, inputValue: circleCode,
                    headerLabel: "Join Circle", inputLabel: "Circle Code", placeholder: "Enter Circle Code"
                })
            }
            this.fetchCurrentLocation();
        } catch (error) {

        }
    }

    //------current location start------//
    fetchCurrentLocation() {
        try {
            Geolocation.getCurrentPosition(
                (position) => {
                    console.log('position', position);
                }, (error) => { console.log(error), alert("Please enable location") }, {
                enableHighAccuracy: false, timeout: 20000,
            }
            );
        } catch (error) {
            console.log('error1111', error);
        }
    }
    //------current location end------// 

    async getCircle() {
        try {
            let user = JSON.parse(await StorageService.fetch('user'));
            this.setState({ isLoading: true, refreshing: true });
            let uri = UriConfig.uri.GET_ALL_GROUP;
            let params = '';
            ApiService.call('get', uri + "/" + user._id, params, (content) => {
                console.log('content1111111', content);
                this.setState({ isLoading: false, refreshing: false });
                let groups = content.groups.filter(f => f.created_by._id === user._id)
                groups.reverse();
                this.setState({ circle: groups });
                if (content.groups.length == 0) {
                    ToastAndroid.show('No circle are available!..', ToastAndroid.LONG);
                }
            }, (error, errors, content) => {
                this.setState({ circle: [], isLoading: false, refreshing: false });
            });
        } catch (error) {
            console.log(error);
        }
    }

    async createCircle() {
        try {
            this.setState({ isLoading: true, modelCreateCircle: false, });
            let user = JSON.parse(await StorageService.fetch('user'))
                , { inputValue } = this.state
                , uri = UriConfig.uri.CREATE_GROUP
                , params = {
                    groupName: inputValue,
                    user_id: user._id
                };
            ApiService.call('post', uri, params, (content) => {
                console.log('content1111111', content);
                this.getCircle();
                this.setState({
                    isLoading: false, inputValue: ""
                });
                ToastAndroid.showWithGravityAndOffset(
                    "Circle created successfully",
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

    async joinCircle() {
        try {
            this.setState({ isLoading: true, modelCreateCircle: false, });
            let user = JSON.parse(await StorageService.fetch('user'))
                , { inputValue } = this.state
                , uri = UriConfig.uri.ADD_TO_GROUP
                , params = {
                    share_code: inputValue,
                    user_id: user._id
                };
            ApiService.call('post', uri, params, async (content, status) => {
                console.log('content1111111', content);
                this.getCircle();
                this.setState({
                    isLoading: false, inputValue: ""
                });
                ToastAndroid.show(status.message, ToastAndroid.LONG);
                // ToastAndroid.show('Circle joined successfully', ToastAndroid.LONG);
            }, (error, errors, content) => {
                this.setState({ circle: [], isLoading: false, });
            });
        } catch (error) {
            console.log(error);
        }
    }

    render() {
        let { circle, refreshing, isLoading, modelCreate, modelCreateCircle, inputValue,
            headerLabel, inputLabel, placeholder } = this.state;
        // console.log('circle'.circle);
        return (
            <View style={styles.container}>

                {circle.length > 0 &&
                    <FlatList
                        style={{ marginTop: 5 }}
                        data={circle}
                        refreshing={refreshing}
                        // onRefresh={() => this.getCircle()}
                        keyExtractor={item => item._id.toString()}
                        contentContainerStyle={{ paddingBottom: 40 }}
                        renderItem={({ item, index }) => {
                            return (
                                <TouchableOpacity activeOpacity={0.70}
                                    onPress={() => { NavigationService.navigate('homeStack', 'CircleDetails', { itemData: item }) }}
                                    style={styles.vwList}>
                                    <View style={{
                                        justifyContent: 'center', alignItems: 'center',
                                        height: 50, width: 50, borderRadius: 25,
                                        backgroundColor: Colors.yellow
                                    }}>
                                        <Text style={[styles.txtListLabel, { color: "#FFF", fontSize: 20 }]}>{item.name.slice(0, 1)}</Text>
                                        {/* <Image source={{ uri: item.url }} resizeMode="contain" style={{ height: 50, width: 50, }} /> */}
                                    </View>
                                    <View style={{ marginLeft: 10, flexDirection: 'row', flex: 1 }}>
                                        <View style={{ flex: 8 }}>
                                            <Text style={styles.txtListLabel}>{item.name} ({item.users.length})</Text>

                                            <Text style={styles.txtList}>{moment(item.created_at).format('DD MMMM YYYY hh:mm: A')}</Text>
                                        </View>
                                    </View>
                                    {/* <View style={{ flexDirection: 'row' }}>
                                        <RightIcon name="right" size={24} color={Colors.black} />
                                    </View> */}
                                </TouchableOpacity>
                            )
                        }} />
                }
                {circle.length == 0 &&
                    <Text style={[styles.txtListLabel, { color: "#333", fontSize: 20, textAlign: 'center', marginTop: '50%' }]}
                    >No Circle are available. {'\n'} Please create new Circle</Text>
                }
                <Modal
                    animationType='fade'
                    supportedOrientations={['portrait', 'landscape']}
                    transparent={true}
                    visible={modelCreate}
                    onRequestClose={() => { this.setState({ modelCreate: false }) }}>
                    <View style={styles.vwModel}>
                        <TouchableOpacity activeOpacity={1}
                            onPress={() => { this.setState({ modelCreate: false }) }}
                            style={{ flex: 8.5, backgroundColor: Colors.noColor }} />
                        <View style={styles.vwModelButton}>
                            <TouchableOpacity activeOpacity={0.70}
                                onPress={() => {
                                    this.setState({
                                        modelCreate: false, modelCreateCircle: true,
                                        headerLabel: "Create Your Circle", inputLabel: "Circle Name", placeholder: "Enter Circle Name"
                                    })
                                }}
                                style={styles.btnModel}>
                                <Text style={styles.txtModelButton}>Create Circle</Text>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.70}
                                onPress={() => {
                                    this.setState({
                                        modelCreate: false, modelCreateCircle: true,
                                        headerLabel: "Join Circle", inputLabel: "Circle Code", placeholder: "Enter Circle Code"
                                    })
                                }}
                                style={styles.btnModel}>
                                <Text style={styles.txtModelButton}>Join Circle</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
                <Modal
                    animationType='slide'
                    supportedOrientations={['portrait', 'landscape']}
                    transparent={true}
                    visible={modelCreateCircle}
                    onRequestClose={() => { this.setState({ modelCreateCircle: false }) }}>
                    <View style={{
                        marginTop: 20,
                        flex: 1,
                        backgroundColor: Colors.white,
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                        elevation: 3
                    }}>
                        <View style={styles.vwHeaderChild}>
                            <View style={{
                            }}>
                                <Text style={styles.txtBottomLabel}>{headerLabel}</Text>
                            </View>
                            <View style={styles.vwHeaderRight}>
                                <TouchableOpacity
                                    onPress={() => this.setState({ modelCreateCircle: false })}
                                    style={{ width: 50, alignItems: 'flex-end' }}>
                                    <Icon name={'close'} size={35} color={Colors.black} />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.vwSettingRowCard}>
                            <View style={{ width: '100%' }}>
                                <Text style={styles.txtBottom}>{inputLabel}</Text>
                                <TextInput
                                    placeholder={placeholder}
                                    value={inputValue}
                                    onChangeText={(text) => { this.setState({ inputValue: text }) }}
                                    style={styles.input}
                                />
                            </View>
                            <View style={styles.vwHeaderRight}>
                                {/* <Text style={[styles.txtBottom, { color: Colors.yellow }]}>Employee</Text> */}
                            </View>
                        </View>
                        <TouchableOpacity activeOpacity={0.70}
                            onPress={() => { headerLabel == "Create Your Circle" ? this.createCircle() : this.joinCircle() }}
                            style={[styles.btnModel, { marginTop: 55 }]}>
                            <Text style={styles.txtModelButton}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </Modal>
                <TouchableOpacity activeOpacity={0.70}
                    onPress={() => { this.setState({ modelCreate: true }) }}
                    style={styles.vwFloating}>
                    <Icon name={'plus'} size={25} color={Colors.white} />
                </TouchableOpacity>
                <Loader loading={isLoading} />
            </View>
        );
    };
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.theme.lightBackgroundColor
    },
    vwList: {
        marginTop: 10,
        borderRadius: 7,
        marginHorizontal: 8,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        alignItems: 'center',
        backgroundColor: Colors.white,
        elevation: 3
    },
    txtListLabel: {
        color: Colors.black,
        fontSize: 16,
        fontWeight: 'bold',
    },
    txtList: {
        color: Colors.black,
        fontSize: 14,
    },
    vwModel: {
        flex: 1,
        backgroundColor: Colors.transparentColor
    },
    vwModelButton: {
        flex: 1.5,
        backgroundColor: Colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    btnModel: {
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        height: 42,
        width: 160,
        borderRadius: 10,
        backgroundColor: Colors.black,
        marginTop: 20
    },
    txtModelButton: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold'
    },
    vwFloating: {
        backgroundColor: '#595959',
        height: 50,
        width: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 30,
        right: 20
    },
    vwHeaderChild: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
    },
    txtBottomLabel: {
        color: Colors.black,
        fontSize: 16,
        fontWeight: 'bold',
    },
    vwHeaderRight: {
        flex: 8,
        justifyContent: 'flex-end',
        flexDirection: 'row',
        alignItems: 'center'
    },
    vwSettingRowCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 20,
        paddingHorizontal: 15,
        backgroundColor: Colors.white,
        elevation: 3
    },
    txtBottom: {
        color: Colors.black,
        fontSize: 14,
    },
    input: {
        width: "100%",
        height: 45,
        backgroundColor: '#fff',
        padding: 10,
        elevation: 3,
        marginTop: 5,
        borderRadius: 5,
    },
})