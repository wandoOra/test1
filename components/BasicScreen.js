import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Image, StyleSheet, ScrollView, StatusBar,
  Dimensions, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import { Button, Input, withTheme, Text } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoadingIndicator from '../components/LoadingIndicator';
import Footer from '../components/Footer';
import EmptyGap from '../components/EmptyGap';

import { apiService } from '../service';

import theme from '../constants/Theme';
import { max } from 'ramda';
const { width, height } = Dimensions.get('screen');

const BasicScreen = ({
  header,
  children,
  style,
  scrollContainerStyle,
  scrollViewRef,
  light,
  statusBarBackground
}) => {

  const innerScrollViewRef = useRef();

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : null}
      style={{...styles.contentView, ...(style || [])}}
      enabled
    >
      {!!header && header}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        ref={scrollViewRef || innerScrollViewRef}
        style={{...styles.scrollView, ...(scrollContainerStyle || [])}}
        contentContainerStyle={styles.innerView}
      >
        {/* <View style={styles.innerView}> */}
          {children}
          <EmptyGap />
          {light ? <Footer light/> : <Footer />}
        {/* </View> */}
      </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  contentView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 96,
  },
  title: {
    textAlign: 'left', alignSelf: 'flex-start', marginLeft: 32
  },
  scrollView: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 0,
    // flexGrow: 1,
  },
  innerView: {
    width: '100%',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
});

export default withTheme(BasicScreen, '');