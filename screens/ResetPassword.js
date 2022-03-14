import React, { useState, useEffect, useRef } from 'react';
import {
  View, Image, Animated, StyleSheet, Keyboard, Dimensions, TouchableWithoutFeedback, TouchableOpacity
} from 'react-native';
import { Button, Input, withTheme, Text } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import EmptyGap from '../components/EmptyGap';
import BasicScreen from '../components/BasicScreen';
import Icon from 'react-native-vector-icons/FontAwesome';

import { apiService } from '../service';
import { Auth } from 'aws-amplify';
import theme from '../constants/Theme';

const { width, height } = Dimensions.get('screen');

const wpay_logo = require('../assets/logo/wpay_black_b.png');

const IMAGE_HEIGHT_SMALL = 48;
const IMAGE_HEIGHT = 96;

const Login = ({
  navigation, route
}) => {

  const scrollViewRef = useRef();
  const passwordRef = useRef();

  const imageHeight = useRef(new Animated.Value(IMAGE_HEIGHT)).current;
  const imagePadding = useRef(new Animated.Value(IMAGE_HEIGHT_SMALL)).current;

  const [status, setStatus] = useState(0);
  const [destination, setDestination] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [errorEmail, setErrorEmail] = useState();
  const [errorCode, setErrorCode] = useState();
  const [errorPassword, setErrorPassword] = useState();
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    navigation.setOptions({ headerShown: false });
    setStatus(0);
    setEmail('');
    setDestination('');
    setCode('');
    setPassword('');
    setErrorEmail('');
    setErrorCode('');
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

  const resetRequest = async () => {
    if (!email.trim()) {
      return setErrorEmail(`Email required`);
    } else {
      setErrorEmail();
    }
    Auth.forgotPassword(email.trim().toLowerCase())
    .then(data => {
      setDestination(data.Destination);
      setStatus(1);
      console.log(data)
    })
    .catch(err => {
      setErrorEmail(err.message)
      console.log(err)
    });
  }

  const resetPassword = () => {
    if (!code.trim()) {
      setErrorCode(`Validation code required`);
    } else {
      setErrorCode();
    }
    if (!password) {
      setErrorPassword(`Password required`);
    } else {
      setErrorPassword();
    }
    console.log(email);
    try {
      Auth.forgotPasswordSubmit(email.trim().toLowerCase(), code, password)
      .then(data => {
        setStatus(2);
      })
      .catch(err => {
        setErrorPassword(err.message);
        console.log(err)
      });
    } catch(err) {
      setErrorPassword(err.message);
      console.log(err)
    }
  }

  return (
    <BasicScreen
      scrollContainerStyle={styles.scrollView}
      scrollViewRef={scrollViewRef}
      style={{marginTop: 0}}
    >
      <Animated.Image source={wpay_logo} style={[styles.logo, { height: imageHeight, marginTop: imagePadding }]} />
      <Text h3 style={{...styles.title}}>
        reset password
      </Text>
      {status === 0 && <>
        <Input
          inputContainerStyle={styles.input}
          label={<Text >business email</Text>}
          placeholder='name@business.com'
          keyboardType='email-address'
          returnKeyType='send'
          errorStyle={styles.error}
          errorMessage={(errorEmail||'').toLowerCase()}
          errorProps={{multiline: true}}
          value={email}
          clearButtonMode='while-editing'
          onChange={(event) => {
            setEmail(event.nativeEvent.text.trim())
          }}
          onSubmitEditing={resetRequest}
        />
        <EmptyGap />
        <Button
          title="reset"
          buttonStyle={styles.button}
          titleStyle={{fontWeight: 'bold'}}
          containerStyle={styles.buttonContainer}
          onPress={resetRequest}
        />
      </>}
      {status === 1 && <>
        <Text multiline style={styles.info}>A verification code has been sent to your email: {destination}</Text>
        <Input
          inputContainerStyle={styles.input}
          label={<Text >verification code</Text>}
          placeholder=''
          keyboardType='number-pad'
          returnKeyType='next'
          errorStyle={styles.error}
          errorMessage={(errorEmail||'').toLowerCase()}
          errorProps={{multiline: true}}
          value={code}
          clearButtonMode='while-editing'
          onChange={(event) => {
            setCode(event.nativeEvent.text.trim())
          }}
          onSubmitEditing={() => passwordRef.current.focus()}
        />
        <Input
          ref={passwordRef}
          inputContainerStyle={styles.input}
          label={<Text >password</Text>}
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
          onSubmitEditing={resetPassword}
        />
        <Button
          title="reset"
          buttonStyle={styles.button}
          titleStyle={{fontWeight: 'bold'}}
          containerStyle={styles.buttonContainer}
          onPress={resetPassword}
        />
      </>}
      {status === 2 && <>
        <EmptyGap />
        <Text multiline style={styles.info}>Password reset. Please login now.</Text>
        <Button
          title="login"
          buttonStyle={styles.button}
          titleStyle={{fontWeight: 'bold'}}
          containerStyle={styles.buttonContainer}
          onPress={() => navigation.goBack()}
        />
        <EmptyGap />
      </>}
      <View style={styles.commandbar}>
        <TouchableOpacity onPress={() => {navigation.goBack()}}>
          <Text>log in</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {navigation.replace('Signup')}}>
          <Text style={{fontWeight: 'bold'}}>sign up</Text>
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
  info: {
    maxWidth: width - 32, textAlign: 'left', marginBottom: 24, alignSelf: 'flex-start', marginLeft: 10
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
    marginTop: 36,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});

export default withTheme(Login, '');
