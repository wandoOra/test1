import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, StatusBar } from 'react-native';
import { Button, Avatar, withTheme, Text } from 'react-native-elements';
import { Auth } from 'aws-amplify';

import EmptyGap from '../components/EmptyGap';
import BasicScreen from '../components/BasicScreen';

const { width, height } = Dimensions.get('screen');


const Menu = ({
  navigation, route
}) => {

  const scrollViewRef = useRef();
  const [user, setUser] = useState();

  useEffect(() => {
    // navigation.setOptions({ headerShown: false });
    Auth.currentAuthenticatedUser()
    .then(user => {
      setUser(user);
    })
    .catch(err => console.log(err));
  }, [])

  return (
    <BasicScreen
      header={
        <>
          <Text h3 h3Style={{...styles.title, ...styles.header}}>
            Hi {`${user?.attributes.given_name || 'user'}`},
          </Text>
          <Text h3 style={{...styles.title}}>
            choose an option
          </Text>
        </>
      }
      scrollContainerStyle={styles.scrollView}
      scrollViewRef={scrollViewRef}
      style={{marginTop: 0, paddingTop: 96}}
      statusBarBackground='#FFFFFF'
    >
      <StatusBar barStyle='dark-content' backgroundColor='#FFF'/>
      <EmptyGap />
      <Button
        title="pair wristband"
        buttonStyle={styles.button}
        titleStyle={{fontWeight: 'bold'}}
        containerStyle={styles.buttonContainer}
        onPress={() => {
          navigation.replace('SearchUser');
          navigation.closeDrawer();
        }}
      />
      <Button
        title="receive payment"
        buttonStyle={styles.button}
        titleStyle={{fontWeight: 'bold'}}
        containerStyle={styles.buttonContainer}
        onPress={() => {
          navigation.replace('ReceivePayment');
          navigation.closeDrawer();
        }}
      />
      <EmptyGap />
    </BasicScreen>
  );
}

const styles = StyleSheet.create({
  background: {
    width: width,
    height: height
  },
  header: {
    // fontFamily: 'gotham',
  },
  title: {
    textAlign: 'left', alignSelf: 'flex-start', marginLeft: 32,
  },
  scrollView: {
  },
  button: {
    backgroundColor: 'black',
    borderRadius: 100,
    paddingVertical: 12,
  },
  buttonContainer: {
    width: 300,
    marginTop: 40,
  },
});

export default withTheme(Menu, '');