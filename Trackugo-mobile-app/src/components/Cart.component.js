/**
 * Component to handle cart & order related operations.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ToastAndroid
} from 'react-native';

import ButtonComponent from '../components/partials/Button.component';

import { Icon } from 'react-native-elements';

import AppConfig from '../config/app.config';
import UriConfig from '../config/uri.config';

import mainStyle from '../styles/main.style';
import cartStyle from '../styles/cart.style';

import Colors from '../modules/colors.module';
import Loader from '../modules/loader.module';

import ApiService from '../services/api.service';
import GeneralService from '../services/general.service';
import StorageService from '../services/storage.service';
import NavigationService from '../services/navigation.service';
import RazorpayCheckout from 'react-native-razorpay';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';

export default class CartComponent extends Component {
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
      loading: false,
      refreshing: false,
      amount: 0,
      deliveryCharges: 0,
      cartAmount: 0,
      cartProducts: []
    };
  }

  async componentDidMount() {

    let baseUrl = await StorageService.fetch('assets_url'),
      folders = JSON.parse(await StorageService.fetch('folders'));

    this.setState({ imagesBaseUrl: baseUrl + folders.device_images });

    this.getCartProducts();

    this.props.navigation.addListener('didFocus', (payload) => {
      let { order } = this.state;
      if (order) {
        NavigationService.reset([{
          routeName: 'Payments'
        },
        {
          routeName: 'PaymentDetail',
          data: { id: order.payment }
        }]);
      }
    });

  }

  getOrderDetails = () => {

    let { order } = this.state;

    this.setState({ loading: true });

    ApiService.call('get', UriConfig.uri.ORDER_DETAILS + "/" + order._id, {}, (content) => {

      this.setState({
        loading: false,
        order: order
      });


    }, (error, errors, content) => {
      this.setState({ loading: false });
    });
  }

  getCartProducts = () => {

    this.setState({ refreshing: true });

    ApiService.call('get', UriConfig.uri.USER_CART, {}, (content) => {
      // let tmp
      // array.forEach(element => {
      //   cart_items
      // });
      // if (!Array.isArray(arr)) return;
      let quantity = 0, price = 0, delivery_charges = 0;
      content.cart_items.forEach(each => {
        price += each.device_model.price * each.quantity;
        delivery_charges += each.device_model.delivery_charges;
        quantity += each.quantity;
      });
      console.log('price', price);
      console.log('delivery_charges', delivery_charges);
      console.log('quantity', quantity);
      this.setState({
        refreshing: false,
        cartProducts: content.cart_items,
        amount: price,
        deliveryCharges: delivery_charges,
        cartAmount: content.cart_amount
      });

    }, (error, errors, content) => {
      this.setState({ refreshing: false });
    });
  }

  alterCartProduct = (id, change) => {

    let selectedItem = this.itemFromCart(id),
      newQuantity = (selectedItem ? selectedItem.quantity : 0) + change,
      methodType = 'post';

    if (newQuantity <= 0) {
      methodType = 'delete';
      newQuantity = 0;
    } else if (selectedItem) {
      methodType = 'put';
    }

    let params = {
      device_model_id: id,
      quantity: newQuantity
    };

    ApiService.call(methodType, UriConfig.uri.USER_CART + (selectedItem ? "/" + id : ""), params, (content) => {

      this.getCartProducts();

    }, (error, errors, content) => {

    });
  }

  itemFromCart = (id) => {
    let { cartProducts } = this.state,
      selectedItem = null;

    for (let cartProduct of cartProducts) {
      if (cartProduct.device_model._id == id) {
        selectedItem = cartProduct;
      }
    }
    return selectedItem;
  }

  checkout = () => {

    this.setState({ loading: true });

    ApiService.call('post', UriConfig.uri.ORDER_NEW, {}, (content) => {

      this.setState({
        loading: false,
        order: content.order_id
      });
      console.log('ORDER_NEW', content);
      this.payment(content);
      // NavigationService.navigate('homeStack', 'Webview', { content: content });

    }, (error, errors, content) => {
      this.setState({ loading: false });
    });
  }

  async payment(content) {
    try {
      let amount = content.razorpay_order.amount;
      let user = JSON.parse(await StorageService.fetch('user'));
      console.log(user, 'user');
      var options = {
        description: '',
        // image: 'https://i.imgur.com/3g7nmJC.png',
        currency: 'INR',
        key: AppConfig.razorpay_key,
        amount: amount * 100,
        name: 'TrackUGo',
        order_id: content.razorpay_order.id,
        prefill: {
          email: user.email,
          contact: user.phone,
          name: user.username,
        },
        theme: { color: Colors.theme.mainColor }
      }
      RazorpayCheckout.open(options).then((data) => {
        console.log(data, 'RazorpayCheckout');
        this.verifyPayment(content, data);
      }).catch((error) => {
        console.log(error, 'RazorpayCheckout error');
        ToastAndroid.show('Payment failed', ToastAndroid.LONG);
      });
    } catch (error) {
      console.log(error);
    }
  }

  async verifyPayment(content, razorpay) {
    try {
      let uri = UriConfig.uri.ORDER_PAYMENT_RESPONSE,
        params = {
          "amount": content.razorpay_order.amount,
          "razorpay_payment_id": razorpay.razorpay_payment_id,
          "razorpay_order_id": content.razorpay_order.id,
          "razorpay_signature": razorpay.razorpay_signature,
          "message": "message"
        };
      ApiService.call('post', uri + '/' + content.order_id, params, (content) => {
        console.log('ORDER_PAYMENT_RESPONSE', content);
        this.setState({ isLoading: false });
        ToastAndroid.show('Payment success', ToastAndroid.LONG);
        NavigationService.navigate('homeStack', 'Home')
      }, (error, errors, content) => {
        ToastAndroid.show('Payment failed', ToastAndroid.LONG);
        this.setState({ circle: [], isLoading: false, });
      });
    } catch (error) {
      console.log(error);
    }
  }

  render() {

    let { refreshing, cartProducts, amount, deliveryCharges, cartAmount } = this.state;

    return (
      <View style={mainStyle.flexOne}>
        <View style={[mainStyle.contentArea, { paddingBottom: 30 }]}>
          <Loader loading={this.state.loading} />

          <FlatList
            data={cartProducts}
            refreshing={refreshing}
            onRefresh={() => this.getCartProducts()}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => item._id}
            ListEmptyComponent={this.renderEmptyContainer()}
            renderItem={({ item, index, separators }) => {

              let deviceModel = item.device_model,
                cartItem = this.itemFromCart(deviceModel._id);

              return (
                <TouchableOpacity activeOpacity={0.80}
                  onPress={() => NavigationService.navigate('homeStack', 'ProductDetail', { id: deviceModel._id })}
                  style={[cartStyle.cartItem, mainStyle.flexRow]}>

                  {/* <View style={[cartStyle.cartLeftPart, mainStyle.flexOne]}>
                    {this.renderProductImage(deviceModel.image_files)}
                  </View> */}
                  <View style={{
                    flex: 4.5, backgroundColor: Colors.lightGray, borderRadius: 10, marginVertical: 5
                  }}>
                    <View style={mainStyle.itemsCenter}>
                      {this.renderProductImage(deviceModel.image_files)}
                    </View>
                  </View>
                  <View style={{
                    flex: 5.5, paddingLeft: 10
                  }}>
                    <View style={mainStyle.flexThree}>
                      <Text style={[mainStyle.textlg, mainStyle.fontbl]}>{deviceModel.model_name}</Text>
                      <Text style={[mainStyle.textnm, mainStyle.lightText, mainStyle.fontmd]}>{GeneralService.amountString(deviceModel.price + deviceModel.delivery_charges)}</Text>
                      {/* <View style={cartStyle.deliveryRow}>
                        <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontlt,]}>Delivery Charges ({deviceModel.delivery_time})</Text>
                        <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontlt,]}>{GeneralService.amountString(deviceModel.delivery_charges)}</Text>
                      </View> */}
                    </View>
                    <View style={[mainStyle.itemsCenter, { justifyContent: 'center', alignItems: 'center' }]}>
                      <View style={cartStyle.productButtonView}>
                        <TouchableOpacity onPress={() => this.alterCartProduct(deviceModel._id, -1)}>
                          <View style={[cartStyle.productButton, { borderTopLeftRadius: 20, borderBottomLeftRadius: 20 }]}>
                            <Icon name='minus' type='font-awesome' size={12} color={Colors.white} />
                          </View>
                        </TouchableOpacity>
                        <Text style={cartStyle.productCount}>{cartItem ? cartItem.quantity : 0}</Text>
                        <TouchableOpacity onPress={() => this.alterCartProduct(deviceModel._id, 1)}>
                          <View style={[cartStyle.productButton, { borderTopRightRadius: 20, borderBottomRightRadius: 20 }]}>
                            <Icon name='plus' type='font-awesome' size={12} color={Colors.white} />
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )
            }}
          />
          {
            cartAmount > 0 &&
            <View style={cartStyle.DetailBottomCard}>
              <View style={cartStyle.DetailBottomCardRow}>
                <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontlt,]}>Price</Text>
                <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontlt,]}>{GeneralService.amountString(amount)}</Text>
              </View>
              <View style={cartStyle.DetailBottomCardRow}>
                <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontlt,]}>Delivery Charges</Text>
                <Text style={[mainStyle.textlg, mainStyle.lightText, mainStyle.fontlt,]}>{GeneralService.amountString(deliveryCharges)}</Text>
              </View>
              <View style={cartStyle.DetailBottomCardLine} />

              <View style={[cartStyle.DetailBottomCardRow, cartStyle.DetailBottomCardRowTotal]}>
                <Text style={[mainStyle.textlg, { color: Colors.yellow }, mainStyle.fontbl,]}>Total Amount</Text>
                <Text style={[mainStyle.textlg, { color: Colors.yellow }, mainStyle.fontbl,]}>{GeneralService.amountString(cartAmount)}</Text>
              </View>
            </View>
          }
        </View>
        {
          cartAmount > 0 &&
          <View style={cartStyle.checkoutButtonView}>
            <ButtonComponent text={"Checkout " + GeneralService.amountString(cartAmount)} onClick={this.checkout.bind(this)} />
          </View>
        }
      </View>
    );
  }

  renderProductImage(imageFiles) {

    let imageFile = imageFiles && imageFiles.length > 0 ? imageFiles[0] : null,
      imageFileUrl = this.state.imagesBaseUrl && imageFile ? (this.state.imagesBaseUrl + imageFile.file_name) : null;

    if (imageFileUrl) {
      return (
        // <Image source={{ uri: imageFileUrl }} style={cartStyle.productImage} />
        <Image source={{ uri: 'https://www.letstrack.in/img/Products/Big/Image1/11_3.png' }} style={cartStyle.productImage} />
      );
    } else {
      return (
        // <Icon name='microchip' type='font-awesome' size={60} color={Colors.gray} />
        <Image source={{ uri: 'https://www.letstrack.in/img/Products/Big/Image1/11_3.png' }} style={cartStyle.productImage} />
      );
    }
  }

  renderEmptyContainer() {
    return (
      <View style={mainStyle.itemsCenter}>
        <Text style={mainStyle.fontrg}>{this.state.refreshing ? "Fetching cart items..." : "No item added in cart yet."}</Text>
      </View>
    );
  }

}