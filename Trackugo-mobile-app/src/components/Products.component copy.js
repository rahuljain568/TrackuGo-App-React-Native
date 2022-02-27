/**
 * Component to handle device product related operations.
 */

import React, { Component } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ScrollView,
  Dimensions,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';

import { Icon } from 'react-native-elements';
import ButtonComponent from '../components/partials/Button.component';

import UriConfig from '../config/uri.config';

import mainStyle from '../styles/main.style';
import productStyle from '../styles/product.style';

import Loader from '../modules/loader.module';
import Colors from '../modules/colors.module';

import ApiService from '../services/api.service';
import GeneralService from '../services/general.service';
import StorageService from '../services/storage.service';
import NavigationService from '../services/navigation.service';

export default class ProductsComponent extends Component {

  constructor() {
    super();

    this.state = {
      refreshing: false,
      products: [],
      cartProducts: [],
      tabSelected: '',
    };
  }

  async componentDidMount() {

    let baseUrl = await StorageService.fetch('assets_url'),
      folders = JSON.parse(await StorageService.fetch('folders'));

    this.setState({ imagesBaseUrl: baseUrl + folders.device_images });

    this.props.navigation.addListener('didFocus', (payload) => {
      this.getProducts();
    });
  }

  getProducts = () => {

    this.setState({ refreshing: true });

    ApiService.call('get', UriConfig.uri.DEVICE_MODELS + "?category=" + this.state.tabSelected, {}, (content) => {

      this.setState({
        refreshing: false,
        products: content.device_models
      });

      this.getCartProducts();

    }, (error, errors, content) => {
      this.setState({ refreshing: false });
    });
  }

  getCartProducts = () => {

    ApiService.call('get', UriConfig.uri.USER_CART, {}, (content) => {

      this.setState({ cartProducts: content.cart_items });

    }, (error, errors, content) => {

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

  tabSelect = (tab) => {
    this.setState({ tabSelected: tab }, () => {
      this.getProducts();
    });
  }

  render() {

    let { refreshing, products, cartProducts, tabSelected } = this.state;
    let size = Dimensions.get('window').width / 2;

    return (
      <View style={mainStyle.flexOne}>
        <View style={[mainStyle.contentArea, { paddingBottom: 80 }]}>

          <View style={productStyle.tabs}>
            <Text style={[productStyle.tab, mainStyle.fontmd, tabSelected == "" ? productStyle.tabActive : null]} onPress={() => this.tabSelect('')}>All</Text>
            <Text style={[productStyle.tab, mainStyle.fontmd, tabSelected == "2_WHEELER" ? productStyle.tabActive : null]} onPress={() => this.tabSelect('2_WHEELER')}>2 Wheeler</Text>
            <Text style={[productStyle.tab, mainStyle.fontmd, tabSelected == "4_WHEELER" ? productStyle.tabActive : null]} onPress={() => this.tabSelect('4_WHEELER')}>4 Wheeler</Text>
          </View>

          <FlatList
            // numColumns={2}
            data={products}
            refreshing={refreshing}
            onRefresh={() => this.getProducts()}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item, index) => item._id}
            ListEmptyComponent={this.renderEmptyContainer()}
            renderItem={({ item, index, separators }) => {

              let cartItem = this.itemFromCart(item._id);

              return (

                <TouchableOpacity activeOpacity={0.80}
                  onPress={() => NavigationService.navigate('homeStack', 'ProductDetail', { id: item._id })}
                  style={productStyle.productItem}>
                  {/* <View style={[productStyle.productItem, { width: size - 20 }]}> */}
                  <View style={{
                    flex: 4.5, backgroundColor: Colors.lightGray, borderRadius: 10, marginVertical: 5
                  }}>
                    <View style={mainStyle.itemsCenter}>
                      {this.renderProductImage(item.image_files)}
                    </View>
                  </View>
                  <View style={{
                    flex: 5.5, paddingLeft: 10
                  }}>
                    <Text style={[productStyle.productTitle, mainStyle.fontbl]}>{item.model_name}</Text>
                    <Text style={[productStyle.productDetail, mainStyle.fontlt]} numberOfLines={3}>{item.model_description} In marketing, a product is an object or system made available for consumer use; it is anything that can be offered to a market to satisfy the desire or need of a</Text>

                    <View style={[mainStyle.itemsCenter, {
                      position: 'absolute', bottom: 5, right: 0, left: 10,
                      flexDirection: 'row', justifyContent: 'space-between'
                    }]}>

                      <Text style={[productStyle.productAmount, mainStyle.fontmd]}>{GeneralService.amountString(item.price)}</Text>

                      <View style={productStyle.productButtonView}>
                        <TouchableOpacity onPress={() => this.alterCartProduct(item._id, -1)}>
                          <View style={[productStyle.productButton, { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }]}>
                            <Icon name='minus' type='font-awesome' size={12} color={Colors.white} />
                          </View>
                        </TouchableOpacity>
                        <Text style={productStyle.productCount}>{cartItem ? cartItem.quantity : 0}</Text>
                        <TouchableOpacity onPress={() => this.alterCartProduct(item._id, 1)}>
                          <View style={[productStyle.productButton, { borderTopRightRadius: 8, borderBottomRightRadius: 8 }]}>
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

        </View>

        {
          cartProducts && cartProducts.length > 0 &&
          <View style={productStyle.cartButtonView}>
            <ButtonComponent text={"Go to Cart (" + cartProducts.length + ")"} onClick={this.navigateToCart.bind(this)} />
          </View>
        }
      </View>
    );
  }

  navigateToCart = () => {
    return NavigationService.navigate('homeStack', 'Cart');
  }

  renderProductImage(imageFiles) {
    let imageFile = imageFiles && imageFiles.length > 0 ? imageFiles[0] : null,
      imageFileUrl = this.state.imagesBaseUrl && imageFile ? (this.state.imagesBaseUrl + imageFile.file_name) : null;

    if (imageFileUrl) {
      return (
        // <Image source={{ uri: imageFileUrl }} style={productStyle.productImage} />
        <Image source={{ uri: 'https://www.letstrack.in/img/Products/Big/Image1/11_3.png' }} style={productStyle.productImage} />
      );
    } else {
      return (
        // <Icon name='microchip' type='font-awesome' size={60} color={Colors.gray} />
        <Image source={{ uri: 'https://www.letstrack.in/img/Products/Big/Image1/11_3.png' }} style={productStyle.productImage} />
      );
    }
  }

  renderEmptyContainer() {
    return (
      <View style={mainStyle.itemsCenter}>
        <Text style={mainStyle.fontrg}>{this.state.refreshing ? "Fetching products..." : "No products found."}</Text>
      </View>
    );
  }

}

export class ProductDetailComponent extends Component {

  constructor() {
    super();

    this.state = {
      loading: false,
      product: null,
      cartProducts: [],
    };
  }

  async componentDidMount() {
    let baseUrl = await StorageService.fetch('assets_url'),
      folders = JSON.parse(await StorageService.fetch('folders'));

    this.setState({ imagesBaseUrl: baseUrl + folders.device_images });

    this.getProduct();
  }

  getProduct = () => {

    let { navigation } = this.props,
      id = navigation.getParam('id', null);

    this.setState({ loading: true });

    ApiService.call('get', UriConfig.uri.DEVICE_MODEL_DETAILS + "/" + id, {}, (content, status) => {

      this.setState({
        loading: false,
        product: content.device_model
      });

      this.getCartProducts();

    }, (error, errors, content) => {
      this.setState({ refreshing: false });
    });
  }

  getCartProducts = () => {

    ApiService.call('get', UriConfig.uri.USER_CART, {}, (content) => {

      this.setState({ cartProducts: content.cart_items });

    }, (error, errors, content) => {

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

  render() {

    let { loading, product } = this.state;
    let cartItem = product ? this.itemFromCart(product._id) : null;

    return (
      <SafeAreaView>
        <View style={mainStyle.contentArea}>
          <ScrollView>
            <Loader loading={loading} />

            {
              product &&
              <View>
                <View style={[mainStyle.flexRow, mainStyle.marginBottom10]}>
                  {this.renderProductImage(product.image_files)}
                  {/* <View style={[mainStyle.flexOne, mainStyle.justifyCenter]}>
                    <Text style={[productStyle.productTitle, mainStyle.fontbl]}>{product.model_name}</Text>
                  </View> */}
                </View>
                <View style={{
                  marginBottom: 5,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  alignSelf: 'center',
                  //  justifyContent: 'center', 
                  width: '99%',
                  paddingVertical: 5,
                  backgroundColor: Colors.white,
                  elevation: 3,
                  padding: 10
                }}>
                  <Text style={[productStyle.productTitle, mainStyle.fontbl]}>{product.model_name}</Text>
                  <View style={mainStyle.dividerWithMargin}></View>
                  <View style={mainStyle.flexRow}>
                    <View>
                      <View style={productStyle.productButtonView}>
                        <TouchableOpacity onPress={() => this.alterCartProduct(product._id, -1)}>
                        <View style={[productStyle.productButton, { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }]}>
                            <Icon name='minus' type='font-awesome' size={12} color={Colors.white} />
                          </View>
                        </TouchableOpacity>
                        <Text style={productStyle.productCount}>{cartItem ? cartItem.quantity : 0}</Text>
                        <TouchableOpacity onPress={() => this.alterCartProduct(product._id, 1)}>
                        <View style={[productStyle.productButton, { borderTopRightRadius: 8, borderBottomRightRadius: 8 }]}>
                            <Icon name='plus' type='font-awesome' size={12} color={Colors.white} />
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={mainStyle.flexOne}>
                      <Text style={[mainStyle.textRight, mainStyle.fontmd]}>Price: {GeneralService.amountString(product.price)}</Text>
                      <Text style={[mainStyle.textRight, mainStyle.fontmd]}>Delivery Charges: {GeneralService.amountString(product.delivery_charges)}</Text>
                    </View>
                  </View>
                  <View style={mainStyle.dividerWithMargin}></View>
                  {
                    product.default_package &&
                    <View>
                      <Text style={[mainStyle.textxl, mainStyle.lightText, mainStyle.fontmd]}>Free Plan</Text>
                      <View style={mainStyle.dividerWithMargin}></View>
                      <Text style={mainStyle.fontrg}>{product.model_description}</Text>
                      <Text style={[mainStyle.textlg, mainStyle.marginBottom10, mainStyle.fontmd]}>{product.default_package.package_name}</Text>
                      <Text style={[mainStyle.textsm, mainStyle.marginBottom5, mainStyle.fontrg]}>{product.default_package.package_description}</Text>
                      <Text style={mainStyle.fontrg}>You will get free plan with device of worth {GeneralService.amountString(product.default_package.price)} which will be valid for {product.default_package.period} Days.</Text>
                    </View>
                  }
                </View>
              </View>
            }
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  renderProductImage(imageFiles) {

    let imageFile = imageFiles && imageFiles.length > 0 ? imageFiles[0] : null,
      imageFileUrl = this.state.imagesBaseUrl && imageFile ? (this.state.imagesBaseUrl + imageFile.file_name) : null;

    if (imageFileUrl) {
      return (
        // <Image source={{ uri: imageFileUrl }} style={productStyle.productImageSmall} />
        <Image source={{ uri: 'https://www.letstrack.in/img/Products/Big/Image1/11_3.png' }} style={productStyle.productImage} />
      );
    } else {
      return (
        // <Icon name='microchip' type='font-awesome' size={100} color={Colors.gray} style={productStyle.productImage} />
        <Image source={{ uri: 'https://www.letstrack.in/img/Products/Big/Image1/11_3.png' }} style={productStyle.productImage} />
      );
    }
  }
}