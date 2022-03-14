import React from 'react';
import {
  Image, TouchableOpacity, StyleSheet, Platform, Dimensions,
  View, Text, Linking, StyleProp, TextStyle, ViewStyle,
} from 'react-native';
import { withNavigation } from '@react-navigation/compat';
import { useNavigation } from '@react-navigation/native';
import { Header as HeaderRNE, Icon } from 'react-native-elements';

import theme from '../constants/Theme';

const { height, width } = Dimensions.get('window');
const iPhoneX = () => Platform.OS === 'ios' && (height === 812 || width === 812 || height === 896 || width === 896);

const logo = require('../assets/logo/wc_black_lb.png');
const logo_light = require('../assets/logo/wc_white_lb.png');

class Footer extends React.Component {

  handleLeftPress = () => {
    const { back, navigation } = this.props;
    return (back && navigation.goBack());
  }

  handleRightPress = () => {
    const { right, onRightPress } = this.props;
    return (right && onRightPress && onRightPress() );
  }

  render() {
    const { light } = this.props;

    return (
      <View style={styles.container}>
        <Image source={!!light ? logo_light : logo} style={styles.logo}/>
      </View>
    );
  }
}

export default Footer;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: width * 0.9,
    height: 98,
    paddingTop: 12,
    paddingBottom: 24,
    marginBottom: 20
  },
  logo: {
    width: width * 0.7,
    height: 64,
    resizeMode: 'contain'
  },
});