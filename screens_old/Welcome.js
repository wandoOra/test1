import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { Button, ButtonGroup, withTheme, Text } from 'react-native-elements';

import theme from '../constants/Theme';
const logo = require('../assets/logo.png');
const { width, height } = Dimensions.get('screen');

const Weclome = ({
  navigation
}) => {

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [])

  const goNext = () => {
    navigation.replace('SearchUser')
  }

  return (
    <>
      <View style={styles.contentView}>
        <Image source={logo} style={styles.logo}/>
        <Button
          title="Start"
          onPress={goNext}
          buttonStyle={{
            backgroundColor: theme.COLORS.BUTTON_COLOR,
            borderRadius: 3,
          }}
          containerStyle={{
            width: 200,
            marginHorizontal: 50,
            marginVertical: 10,
          }}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  contentView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: height * 0.1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  logo: {
    width: width * 0.9,
    height: 150,
    resizeMode: 'contain'
  }
});

export default withTheme(Weclome, '');