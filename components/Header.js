import React from 'react';
import {
  ImageBackground, TouchableOpacity, StyleSheet, Platform, Dimensions,
  View, Text, Linking, StyleProp, TextStyle, ViewStyle,
} from 'react-native';
import { withNavigation } from '@react-navigation/compat';
import { DrawerActions } from '@react-navigation/native';
import { Header as HeaderRNE } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import theme from '../constants/Theme';

const { height, width } = Dimensions.get('window');
const iPhoneX = () => Platform.OS === 'ios' && (height === 812 || width === 812 || height === 896 || width === 896);

class Header extends React.Component {

  handleLeftPress = () => {
    const { back, navigation } = this.props;
    return (back && navigation.goBack());
  }

  handleRightPress = () => {
    const { right, onRightPress } = this.props;
    return (right && onRightPress && onRightPress() );
  }

  render() {
    const { back, title, right, menu, navigation} = this.props;

    return (
      <HeaderRNE
        statusBarProps={{barStyle: 'dark-content', backgroundColor: '#FFF'}}
        containerStyle={{...styles.navbar}}
        barStyle="dark-content"
        leftComponent={{ icon: (back ? 'chevron-left' : ''), color: '#000', onPress: () => this.handleLeftPress() }}
        centerComponent={{ text: title, style: {...styles.title} }}
        // rightComponent={menu ? <Icon name='bars' size={24} color='#000'></Icon> : <></>}
        rightComponent={menu ?
          {
            icon: 'menu', style: {color: '#000', padding: 4 },
            onPress: () => {
              navigation.dispatch(DrawerActions.toggleDrawer());
            } 
          }
          :
          {}
        }
      />
    );
  }
}

export default withNavigation(Header);

const styles = StyleSheet.create({
  navbar: {
    backgroundColor: 'transparent',
    color: theme.COLORS.BLACK,
    paddingVertical: 0,
    paddingBottom: theme.SIZES.BASE * 1.5,
    paddingTop: iPhoneX ? theme.SIZES.BASE * 4 : theme.SIZES.BASE,
    height: 96,
    zIndex: 5,
    borderBottomWidth: 0,
  },
  shadow: {
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    shadowOpacity: 0.2,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.COLORS.BLACK,
  },
});