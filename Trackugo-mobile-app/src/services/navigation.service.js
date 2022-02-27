import {
    StackActions,
    DrawerActions,
    NavigationActions,
} from 'react-navigation';

let authNavigator;
let homeStackNavigator;
let homeDrawerNavigator;

function setNavigator(navigatorType, navigatorRef) {

    switch (navigatorType) {
        case 'auth':
            authNavigator = navigatorRef;
            break;

        case 'homeDrawer':
            homeDrawerNavigator = navigatorRef;
            break;

        case 'homeStack':
            homeStackNavigator = navigatorRef;
            break;

        default:
            break;
    }
}

function navigate(navigatorType, routeName, params) {

    let navigator;
    switch (navigatorType) {
        case 'auth':
            navigator = authNavigator;
            break;

        case 'homeDrawer':
            navigator = homeDrawerNavigator;
            break;

        case 'homeStack':
            navigator = homeStackNavigator;
            break;

        default:
            break;
    }

    navigator.dispatch(
        NavigationActions.navigate({
            routeName,
            params,
        })
    );

    drawerClose();

}

function drawerOpen() {
    homeDrawerNavigator.dispatch(DrawerActions.openDrawer());
}

function drawerClose() {
    if (homeDrawerNavigator) {
        homeDrawerNavigator.dispatch(DrawerActions.closeDrawer());
    }
}

function back() {
    if (homeStackNavigator) {
        homeStackNavigator.dispatch(NavigationActions.back());
    }
}

function reset(navs) {
    if (homeStackNavigator) {

        let actions = [
            navigate('homeStack', 'Home')
        ],
            index = 0;

        if (Array.isArray(navs)) {
            for (let nav of navs) {
                if (nav && nav.routeName) {
                    actions.push(navigate('homeStack', nav.routeName, nav.data || {}));
                }
            }

            index += navs.length;
        }

        const resetAction = StackActions.reset({
            index: index,
            actions: actions
        });
        homeStackNavigator.dispatch(resetAction);
    }
}

export default {
    back,
    reset,
    navigate,
    drawerOpen,
    drawerClose,
    setNavigator
};