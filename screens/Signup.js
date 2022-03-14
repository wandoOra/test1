import React, { useState, useEffect, useRef } from 'react';
import {
  View, Image, Animated, StyleSheet, Keyboard, Dimensions, TouchableWithoutFeedback, TouchableOpacity
} from 'react-native';
import { Button, Input, withTheme, Text } from 'react-native-elements';
import PhoneInput from "react-native-phone-number-input";
import DeviceCountry from 'react-native-device-country';
import EmptyGap from '../components/EmptyGap';
import BasicScreen from '../components/BasicScreen';
import LoadingIndicator from '../components/LoadingIndicator';
import Icon from 'react-native-vector-icons/FontAwesome';

import { apiService } from '../service';
import { Auth } from 'aws-amplify';
import theme from '../constants/Theme';

const { width, height } = Dimensions.get('screen');

const wpay_logo = require('../assets/logo/wpay_black_b.png');

const ADMIN_GROUP = 'ADMIN';
const IMAGE_HEIGHT_SMALL = 48;
const IMAGE_HEIGHT = 96;

const Signup = ({
  navigation, route
}) => {

  const scrollViewRef = useRef();

  const [status, setStatus] = useState('signup')

  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef();
  const phoneRef = useRef();
  const passwordRef = useRef();
  const phoneInput = useRef();

  const imageHeight = useRef(new Animated.Value(IMAGE_HEIGHT)).current;
  const imagePadding = useRef(new Animated.Value(IMAGE_HEIGHT_SMALL)).current;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [errorFN, setErrorFN] = useState();
  const [errorLN, setErrorLN] = useState();
  const [errorEmail, setErrorEmail] = useState();
  const [errorPhone, setErrorPhone] = useState();
  const [errorPassword, setErrorPassword] = useState();
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('US')

  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    setErrorFN('');
    setErrorLN('');
    setErrorEmail('');
    setErrorPassword('');

    Keyboard.addListener("keyboardWillShow", _keyboardDidShow);
    Keyboard.addListener("keyboardWillHide", _keyboardDidHide);
    Keyboard.addListener("keyboardDidShow", _keyboardDidShow);
    Keyboard.addListener("keyboardDidHide", _keyboardDidHide);

    // cleanup function
    return () => {
      Keyboard.removeListener("keyboardWillShow", _keyboardDidShow);
      Keyboard.removeListener("keyboardWillHide", _keyboardDidHide);
      Keyboard.removeListener("keyboardDidShow", _keyboardDidShow);
      Keyboard.removeListener("keyboardDidHide", _keyboardDidHide);
    };
  }, []);

  const _keyboardDidShow = (event) => {
    Animated.timing(imageHeight, {
      duration: event.duration || 300,
      toValue: IMAGE_HEIGHT_SMALL,
      useNativeDriver: false
    }).start();
    Animated.timing(imagePadding, {
      duration: event.duration || 300,
      toValue: Platform.OS === "ios" ? 32 : 16,
      useNativeDriver: false
    }).start();
  }
  const _keyboardDidHide = (event) => {
    Animated.timing(imageHeight, {
      duration: event.duration || 300,
      toValue: IMAGE_HEIGHT,
      useNativeDriver: false
    }).start();
    Animated.timing(imagePadding, {
      duration: event.duration || 300,
      toValue: IMAGE_HEIGHT_SMALL,
      useNativeDriver: false
    }).start();
  }

  const signup = async () => {
    if (!firstName.trim()) {
      scrollViewRef.current.scrollTo({y: 0, animated: true})
      firstNameRef.current.focus();
      return setErrorFN(`First name required`);
    } else {
      setErrorFN();
    }
    if (!lastName.trim()) {
      scrollViewRef.current.scrollTo({y: height * 0.2, animated: true})
      lastNameRef.current.focus();
      return setErrorLN(`Last name required`);
    } else {
      setErrorLN();
    }
    if (!email.trim()) {
      scrollViewRef.current.scrollTo({y: height * 0.4, animated: true})
      emailRef.current.focus();
      return setErrorEmail(`Email required`);
    } else {
      setErrorEmail();
    }
    if (!password) {
      scrollViewRef.current.scrollTo({y: height * 0.8, animated: true})
      passwordRef.current.focus();
      return setErrorPassword(`Password required`);
    } else if (password.length < 8) {
      scrollViewRef.current.scrollTo({y: height * 0.8, animated: true})
      passwordRef.current.focus();
      return setErrorPassword(`Password must be at least 8 characters long`);
    } else {
      setErrorPassword();
    }

    setLoading(true);
    // const isExist = await apiService.checkIfExistAccount(email.trim().toLowerCase());
    // if (isExist) {
    //   scrollViewRef.current.scrollTo({y: height * 0.4, animated: true})
    //   emailRef.current.focus();
    //   setLoading(false);
    //   return setErrorEmail('This email address is already being used. Please try a different email address to sign up.\n\n')
    // }

    try {
      let username = username = email.trim().toLowerCase();
      if (__DEV__) {
        username =username.replace('@', '');
      } else {
        username =username.replace('@', '_');
      }

      const result = await Auth.signUp({
        username: username,
        password: password,
        attributes: {
          email: email.trim().toLowerCase(),
          given_name: `${firstName.trim()} ${lastName.trim()}`,
          phone_number: phone.trim()
        }
      });
      const done = await apiService.createAccount(
        `${firstName.trim()} ${lastName.trim()}`,
        email.trim().toLowerCase(),
        'email'
      );
      console.log('create wandoo account result', done);
      scrollViewRef.current.scrollTo({y: 0, animated: true})
      setStatus('created');
    } catch (error) {
        console.log(error);
        setErrorPassword(error.message || 'Error occured. Please try again.');
    }
    setLoading(false);
  }

  const resetPassword = (username) => {
    navigation.navigate('ResetPassword', { username });
  }

  return (
    <BasicScreen
      scrollContainerStyle={styles.scrollView}
      scrollViewRef={scrollViewRef}
      style={{marginTop: 0}}
    >
      {isLoading &&
        <LoadingIndicator
          backgroundColor="#FFF"
          backDropColor="#48484888"
          text="sign up..."
        />
      }
      <Animated.Image source={wpay_logo} style={[styles.logo, { height: imageHeight, marginTop: imagePadding }]} />
      <Text h3 style={{...styles.title}}>
        {status === 'signup' && 'sign up'}
        {status === 'created' && 'Your account was successfully created.'}
      </Text>
      {status === 'signup' && <>
        <Input
          ref={firstNameRef}
          inputContainerStyle={styles.input}
          label={<Text>first name *</Text>}
          keyboardType='ascii-capable'
          returnKeyType='next'
          errorStyle={{ color: theme.COLORS.ERROR, fontSize: 14 }}
          errorMessage={(errorFN||'').toLowerCase()}
          value={firstName}
          clearButtonMode='while-editing'
          onChange={(event) => {
            setFirstName(event.nativeEvent.text.trim())
          }}
          onSubmitEditing={() => lastNameRef.current.focus()}
        />
        <Input
          ref={lastNameRef}
          inputContainerStyle={styles.input}
          label={<Text>last name *</Text>}
          keyboardType='ascii-capable'
          returnKeyType='next'
          errorStyle={{ color: theme.COLORS.ERROR, fontSize: 14 }}
          errorMessage={(errorLN||'').toLowerCase()}
          value={lastName}
          clearButtonMode='while-editing'
          onChange={(event) => {
            setLastName(event.nativeEvent.text.trim())
          }}
          onSubmitEditing={() => emailRef.current.focus()}
        />
        <Input
          ref={emailRef}
          inputContainerStyle={styles.input}
          label={<Text>business email *</Text>}
          placeholder='name@business.com'
          keyboardType='email-address'
          returnKeyType='next'
          errorStyle={{ color: theme.COLORS.ERROR, fontSize: 14 }}
          errorMessage={(errorEmail||'').toLowerCase()}
          value={email}
          clearButtonMode='while-editing'
          onChange={(event) => {
            setEmail(event.nativeEvent.text.trim())
          }}
          // onSubmitEditing={() => phoneRef && phoneRef.current.focus()}
        />
        <Text style={{alignSelf: 'flex-start', marginLeft: 12}}>contact number</Text>
        <PhoneInput
          ref={phoneRef}
          // defaultValue={value}
          defaultCode={countryCode}
          containerStyle={styles.phoneInput}
          textContainerStyle={{backgroundColor: '#fff'}}
          layout="first"
          onChangeFormattedText={(text) => {
            setPhone(text);
          }}
          // withDarkTheme
          // withShadow
          // autoFocus
        />
        <Input
          ref={passwordRef}
          inputContainerStyle={styles.input}
          label={<Text>password *</Text>}
          rightIcon={<TouchableWithoutFeedback onPressIn={()=>setShowPassword(true)} onPressOut={()=>setShowPassword(false)}><Icon name={showPassword ? 'eye' : 'eye-slash'} size={24} color='#a0a0a0' style={{marginRight: 8}}/></TouchableWithoutFeedback>}
          keyboardType='default'
          returnKeyType='done'
          errorStyle={styles.error}
          errorProps={{multiline: true}}
          errorMessage={(errorPassword||'').toLowerCase()}
          value={password}
          secureTextEntry={!showPassword}
          onChange={(event) => {
            setPassword(event.nativeEvent.text.trim())
          }}
          onSubmitEditing={signup}
        />
        <Button
          title="sign up"
          buttonStyle={styles.button}
          titleStyle={{fontWeight: 'bold'}}
          containerStyle={styles.buttonContainer}
          onPress={signup}
        />
      </>}
      {status === 'created' && <>
        <Text style={{fontSize: 24}}>Please verify your account through your registered email</Text>
        <Button
          title="Login"
          buttonStyle={styles.button}
          titleStyle={{fontWeight: 'bold'}}
          containerStyle={styles.buttonContainer}
          onPress={() => {navigation.navigate('Login')}}
        />
      </>}
      <View style={styles.commandbar}>
        <View/>
        <TouchableOpacity onPress={() => {navigation.navigate('Login')}}>
          <Text style={{fontWeight: 'bold'}}>already have an account? login</Text>
        </TouchableOpacity>
      </View>
      <EmptyGap />
    </BasicScreen>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'left', alignSelf: 'flex-start', marginLeft: 8, marginBottom: 36
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
  phoneInput: {
    borderBottomColor: '#888',
    borderBottomWidth: 1,
    width: width - 60,
    marginBottom: 24
  },
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
    marginTop: 48,
    marginBottom: 24,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});

export default withTheme(Signup, '');
