/**
 * Application starts here.
 */

import React from 'react';
import { MenuProvider } from 'react-native-popup-menu';
import AppNavigator from './src/navigators/app.navigator';

import NavigationService from './src/services/navigation.service';

const App = () => {
  return (
    <MenuProvider>
      <AppNavigator
        ref={navigatorRef => {
          NavigationService.setNavigator('auth', navigatorRef);
        }}
      />
    </MenuProvider>
  );
};

export default App;



/**
 * Create Build
 *
 * 1. cd android/
 * 2. ./gradlew assembleRelease
 * 3. cd ../
 * 4. react-native bundle --dev false --platform android --entry-file index.js --bundle-output ./android/app/build/intermediates/assets/debug/index.android.bundle --assets-dest ./android/app/build/intermediates/res/merged/debug
 */