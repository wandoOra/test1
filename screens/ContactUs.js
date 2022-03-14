import React, { useState, useEffect, useRef } from 'react';
import {
  View, StatusBar, Animated, StyleSheet, Keyboard, Dimensions, TouchableWithoutFeedback, TouchableOpacity, Linking, Share, Image
} from 'react-native';
import { Button, Input, withTheme, Text } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import EmptyGap from '../components/EmptyGap';
import BasicScreen from '../components/BasicScreen';
import LoadingIndicator from '../components/LoadingIndicator';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Ionicons, SimpleLineIcons } from '@expo/vector-icons';

import { apiService } from '../service';
import { Auth } from 'aws-amplify';
import theme from '../constants/Theme';

const { width, height } = Dimensions.get('screen');

const wpay_logo = require('../assets/logo/wpay_black_b.png');
const contact_us = require('../assets/contact/email.png');
const www_png = require('../assets/contact/www.png')
const support_ticket = require('../assets/contact/support.png')
const terms_privacy = require('../assets/contact/tandc.png')
const share = require('../assets/contact/share.png')

const ADMIN_GROUP = 'ADMIN';
const IMAGE_HEIGHT_SMALL = 48;
const IMAGE_HEIGHT = 96;

const ContactUs = ({
  navigation, route
}) => {

  const scrollViewRef = useRef();

  const imageHeight = useRef(new Animated.Value(IMAGE_HEIGHT)).current;
  const imagePadding = useRef(new Animated.Value(IMAGE_HEIGHT_SMALL)).current;

  const onShare = async () => {
    try {
      const result = await Share.share({
        message:
          'https://www.wcashless.com/',
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <BasicScreen
      scrollContainerStyle={styles.scrollView}
      scrollViewRef={scrollViewRef}
      style={{marginTop: 0}}
    >
      <StatusBar barStyle='dark-content' backgroundColor='#FFF'/>
      <Animated.Image source={wpay_logo} style={[styles.logo, { height: imageHeight, marginTop: imagePadding }]} />
      <Text h3 style={{...styles.title}}>
        contact us
      </Text>
      <EmptyGap />
      <View style={styles.row}>
        <Image source={contact_us} style={{width: 30, height: 30}}></Image>
        <TouchableOpacity onPress={() => Linking.openURL('https://www.wcashless.com/contactus')}>
          <Text h5 style={{...styles.rowText, marginLeft: 24, paddingTop: 4}}>
            contact us
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <Image source={www_png} style={{width: 30, height: 30}}></Image>
        <TouchableOpacity onPress={() => Linking.openURL('https://www.wcashless.com')}>
          <Text h5 style={{...styles.rowText, marginLeft: 24, paddingTop: 4}}>
          www.wcashless.com
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <Image source={support_ticket} style={{width: 30, height: 30}}></Image>
        <TouchableOpacity onPress={() => Linking.openURL('https://www.wcashless.com/support-ticket')}>
          <Text h5 style={{...styles.rowText, marginLeft: 24, paddingTop: 4}}>
          support ticket
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <Image source={terms_privacy} style={{width: 30, height: 30}}></Image>
        <TouchableOpacity onPress={() => Linking.openURL('https://www.wcashless.com/privacy')}>
          <Text h5 style={{...styles.rowText, marginLeft: 24, paddingTop: 4}}>
          terms, conditions & privacy policy
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <Image source={share} style={{width: 30, height: 30, left: 2}}></Image>
        <TouchableOpacity onPress={onShare} style={{flexDirection: 'row'}}>
            <Text h5 style={{...styles.rowText, marginLeft: 24, paddingTop: 4}}>
              share wcashless
            </Text>
            <Text h5 style={{...styles.rowText, paddingTop: 4, fontStyle: 'italic'}}> for Business&nbsp;</Text>
        </TouchableOpacity>
      </View>
      <EmptyGap />
    </BasicScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    alignSelf: 'center',
    marginLeft: 8,
    marginBottom: 36,
    fontWeight: 'bold'
  },
  scrollView: {
  },
  logo: {
    width: '100%',
    height: IMAGE_HEIGHT,
    resizeMode: 'contain',
    marginBottom: 20,
    marginTop:20,
  },
  error: { maxWidth: width - 64, textAlign: 'left', marginBottom: 24, color: theme.COLORS.ERROR, fontSize: 14 },
  button: {
    backgroundColor: 'black',
    borderRadius: 100,
    paddingVertical: 12,
  },
  buttonContainer: {
    width: 200,
    marginTop: 36,
  },
  commandbar: {
    width: '100%',
    marginTop: 24,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  row: {
    marginBottom: 36,
    width: 300,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignContent: 'flex-start',
    justifyContent: 'flex-start',
  },
  rowText: {
    fontWeight: 'bold'
  }
});

export default withTheme(ContactUs, '');
