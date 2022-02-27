/**
 * Define the navigation between screen.
 */

import React from 'react';
import { createStackNavigator, createAppContainer, createSwitchNavigator } from 'react-navigation';

import SplashComponent from '../components/partials/Splash.component';
import HeaderBackImageComponent from '../components/partials/HeaderBackImage.component';

import AuthenticationComponent, { SignUpComponent, VerifySignUpComponent } from '../components/Authentication.component';
import ForgotPasswordComponent, { ResetPasswordComponent } from '../components/ForgotPassword.component';
// import LoginComponent from '../components/LoginComponent';
// import NewSignUpComponent from '../components/signupComponent';

import HomeNavigator from './home.navigator';

const AuthNavigator = createStackNavigator(
    {
        Auth: {
            screen: AuthenticationComponent,
            navigationOptions: {
                header: null
            }
        },
        // Login: LoginComponent,
        // NewSignUp: NewSignUpComponent,
        SignUp: {
            screen: SignUpComponent,
            navigationOptions: {
                header: null
            }
        }, 
        VerifySignUp: VerifySignUpComponent,
        ForgotPassword: ForgotPasswordComponent,
        ResetPassword: ResetPasswordComponent
    },
    {
        defaultNavigationOptions: {
            headerStyle: {
                elevation: 0,
            },
            headerBackImage: <HeaderBackImageComponent />
        },
    }
);

const SwitchNavigator = createSwitchNavigator({
    Splash: {
        screen: SplashComponent,
        navigationOptions: {
            header: null
        }
    },
    Auth: { screen: AuthNavigator },
    Home: { screen: HomeNavigator }
});

const AppNavigator = createAppContainer(SwitchNavigator);

export default AppNavigator;