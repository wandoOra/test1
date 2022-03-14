import React, { useState, useReducer, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { Alert, StatusBar, SafeAreaView } from 'react-native';

import NfcManager from 'react-native-nfc-manager';

import AppLoading from './components/AppLoading';
import Screens from './navigation/Screens';

import vectorFonts from './helpers/vector-fonts';
import { cacheImages, cacheFonts } from './helpers/AssetsCaching';

import Amplify, { Auth } from 'aws-amplify';

Amplify.configure({
    Auth: {

        // REQUIRED only for Federated Authentication - Amazon Cognito Identity Pool ID
        identityPoolId: 'us-east-1:94697799-a118-4488-ab90-bb663c480850',

        // REQUIRED - Amazon Cognito Region
        region: 'us-east-1',

        // OPTIONAL - Amazon Cognito Federated Identity Pool Region 
        // Required only if it's different from Amazon Cognito Region
        // identityPoolRegion: 'XX-XXXX-X',

        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: 'us-east-1_TWA1LBAsL',

        // OPTIONAL - Amazon Cognito Web Client ID (26-char alphanumeric string)
        userPoolWebClientId: '73dqu8l5ic43gneinhig1kn0gc',

        // OPTIONAL - Enforce user authentication prior to accessing AWS resources or not
        // mandatorySignIn: false,

        // OPTIONAL - Configuration for cookie storage
        // Note: if the secure flag is set to true, then the cookie transmission requires a secure protocol
        // cookieStorage: {
        // // REQUIRED - Cookie domain (only required if cookieStorage is provided)
        //     domain: '.yourdomain.com',
        // // OPTIONAL - Cookie path
        //     path: '/',
        // // OPTIONAL - Cookie expiration in days
        //     expires: 365,
        // // OPTIONAL - See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite
        //     sameSite: "strict" | "lax",
        // // OPTIONAL - Cookie secure flag
        // // Either true or false, indicating if the cookie transmission requires a secure protocol (https).
        //     secure: true
        // },

        // OPTIONAL - customized storage object
        // storage: MyStorage,

        // OPTIONAL - Manually set the authentication flow type. Default is 'USER_SRP_AUTH'
        // authenticationFlowType: 'USER_PASSWORD_AUTH',

        // OPTIONAL - Manually set key value pairs that can be passed to Cognito Lambda Triggers
        // clientMetadata: { myCustomKey: 'myCustomValue' },

         // OPTIONAL - Hosted UI configuration
        oauth: {
            domain: 'wandooratest-users-linkeds.auth.us-east-1.amazoncognito.com',
            scope: ['phone', 'email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
            redirectSignIn: 'http://localhost:3000/',
            redirectSignOut: 'http://localhost:3000/',
            responseType: 'code' // or 'token', note that REFRESH token will only be generated when the responseType is code
        },
        "federationTarget": "COGNITO_USER_POOLS"
    }
});

// You can get the current config object
const currentConfig = Auth.configure();

export default function App() {

  const [isReady, setIsReady] = useState(false);

  const loadAssetsAsync = async () => {
    const imageAssets = cacheImages([
      ...vectorFonts,
      require('./assets/logo.png'),
    ]);

    const fontAssets = cacheFonts([
      // { gotham: require('./assets/fonts/GothamRounded_Medium.ttf') },
    ]);
    await Promise.all([...imageAssets, ...fontAssets]);
  };

  if (!isReady) {
    return (
      <AppLoading
        startAsync={loadAssetsAsync}
        onFinish={() => {
          setIsReady(true);
        }}
        onError={console.warn}
      />
    );
  }

  return (
    <NavigationContainer>
      <Screens />
    </NavigationContainer>
  );
}