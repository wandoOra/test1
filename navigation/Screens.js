import React from 'react';
import Constants from 'expo-constants';
import { SafeAreaView, Dimensions, Image, StyleSheet } from 'react-native';
import { useNavigationState, NavigationActions } from '@react-navigation/native'
import { Text } from 'react-native-elements';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { Auth } from 'aws-amplify';
import Header from '../components/Header';
import Login from '../screens/Login';
import Signup from '../screens/Signup';
import ResetPassword from '../screens/ResetPassword';
import ContactUs from '../screens/ContactUs';
import Menu from '../screens/Menu';
import ReceivePayment from '../screens/ReceivePayment';
import SearchUser from '../screens/SearchUser';
import PairBracelet from '../screens/PairBracelet';
import Bracelets from '../screens/Bracelets';
import Bracelet from '../screens/Bracelet';

const { width } = Dimensions.get('screen');
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const wpay_logo = require('../assets/logo/wpay_black_b.png');

function SidebarMenu(props) {
  const { state, ...rest } = props;
  const { navigation } = props;
  const newState = { ...state}  
  newState.routes = newState.routes.filter(item => item.name !== 'Menu')

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/*Top Large Image */}
      <Image
        source={wpay_logo}
        style={styles.sideMenuProfileIcon}
      />
      <Text style={{paddingTop: 12, paddingHorizontal: 24, textAlign: 'center', alignSelf: 'center'}}>
        version {`${Constants.nativeAppVersion}(${Constants.nativeBuildVersion})`}
      </Text>
      <DrawerContentScrollView {...props}>
        {/* <DrawerItemList state={newState} {...rest} /> */}
        <DrawerItem
          label="home"
          labelStyle={styles.drawerItemLabel}
          onPress={() => {
            navigation.replace('Menu');
            navigation.closeDrawer();
          }}
        />
        <DrawerItem
          label="pair wristband"
          labelStyle={styles.drawerItemLabel}
          onPress={() => {
            navigation.replace('SearchUser');
            navigation.closeDrawer();
          }}
        />
        <DrawerItem
          label="receive payment"
          labelStyle={styles.drawerItemLabel}
          onPress={() => {
            navigation.replace('ReceivePayment');
            navigation.closeDrawer();
          }}
        />
        <DrawerItem
          label="contact us"
          labelStyle={styles.drawerItemLabel}
          onPress={() => {
            navigation.replace('Contact');
            navigation.closeDrawer();
          }}
        />
        <DrawerItem
          label="log out"
          labelStyle={styles.drawerItemLabel}
          onPress={async () => {
            await Auth.signOut();
            navigation.dangerouslyGetParent().replace('Login');
          }}
        />
      </DrawerContentScrollView>
    </SafeAreaView>
  );
};

const ScreensStack = ({ navigation, route }) => {
  return (
    <Stack.Navigator
      mode="card" initialRouteName="Menu"
    >
      <Stack.Screen
        name="Menu"
        component={Menu}
        options={{
          header: ({ navigation, scene }) => (
            <Header title="" scene={scene} navigation={navigation} />
          ),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="SearchUser"
        component={SearchUser}
        options={{
          header: ({ navigation, scene }) => (
            <Header title="" scene={scene} navigation={navigation} />
          ),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="PairBracelet"
        component={PairBracelet}
        options={{
          header: ({ navigation, scene }) => (
            <Header title="" scene={scene} navigation={navigation} />
          ),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="ReceivePayment"
        component={ReceivePayment}
        options={{
          header: ({ navigation, scene }) => (
            <Header title="" scene={scene} navigation={navigation} />
          ),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="Contact"
        component={ContactUs}
        options={{
          header: ({ navigation, scene }) => (
            <Header title="" scene={scene} navigation={navigation} />
          ),
          headerTransparent: true
        }}
      />
    </Stack.Navigator>
  )
}

function DrawLayout({ navigation, route }) {
  return (
    <Drawer.Navigator
      initialRouteName="Pair"
      drawerContent={(props) => <SidebarMenu {...props} />}
      drawerType="back"
      drawerPosition= 'right'
      drawerContentOptions={{
        activeTintColor: '#fff',
        activeBackgroundColor: '#000',
      }}
      drawerStyle= {{
        backgroundColor: 'white',
        width: width,
      }}
      screenOptions={{
        headerMode: 'screen',
      }}
    >
      {/* <Drawer.Screen name="Menu" component={Menu} /> */}
      
      <Drawer.Screen
        name="Pair"
        options={{ title: 'pair wristband' }}
        component={ScreensStack}
      />
    </Drawer.Navigator>
  )
}

export default function Screens(props) {
  return (
    <Stack.Navigator
      mode="card" initialRouteName="Login"
      screenOptions={{
        headerMode: 'screen',
      }}
    >
      <Stack.Screen
        name="Login"
        component={Login}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              scene={scene}
              navigation={navigation}
            />
          ),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="Signup"
        component={Signup}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              scene={scene}
              navigation={navigation}
            />
          ),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPassword}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              scene={scene}
              navigation={navigation}
            />
          ),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="Root"
        component={DrawLayout}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title=""
              scene={scene}
              navigation={navigation}
              menu
            />
          ),
          headerTransparent: true
        }}
        // options={{
        //   header: ({ navigation, scene }) => (
        //     <Header
        //       title=""
        //       scene={scene}
        //       navigation={navigation}
        //       menu
        //     />
        //   ),
        //   headerTransparent: true
        // }}
      />
      
      <Stack.Screen
        name="Bracelets"
        component={Bracelets}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Bracelets"
              scene={scene}
              navigation={navigation}
              menu
            />
          ),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="Bracelet"
        component={Bracelet}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="Edit Bracelet"
              scene={scene}
              navigation={navigation}
              menu
            />
          ),
          headerTransparent: true
        }}
      />
      <Stack.Screen
        name="AddBracelet"
        component={Bracelet}
        options={{
          header: ({ navigation, scene }) => (
            <Header
              title="New Bracelet"
              scene={scene}
              navigation={navigation}
              menu
            />
          ),
          headerTransparent: true
        }}
      />
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  sideMenuProfileIcon: {
    resizeMode: 'contain',
    width: 100,
    height: 100,
    borderRadius: 100 / 2,
    alignSelf: 'center',
    marginTop: 80
  },
  drawerItemLabel: {
    fontSize: 22,
    paddingHorizontal: 20
  }
});