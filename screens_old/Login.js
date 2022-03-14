import React, { useState, useEffect, useRef } from 'react';
import { 
  View, StatusBar, Animated, StyleSheet, Keyboard, Dimensions, TouchableWithoutFeedback, TouchableOpacity
} from 'react-native';
import { Button, Input, withTheme, Text } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
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

const Login = ({
  navigation, route
}) => {

  const scrollViewRef = useRef();
  const passwordRef = useRef();

  const imageHeight = useRef(new Animated.Value(IMAGE_HEIGHT)).current;
  const imagePadding = useRef(new Animated.Value(IMAGE_HEIGHT_SMALL)).current;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorEmail, setErrorEmail] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setLoading] = useState(false);


  useEffect(() => {
    Auth.currentAuthenticatedUser()
    .then(user => {
      console.log('found user login', user);
      const groups = user.signInUserSession.accessToken.payload['cognito:groups'] || []
      if(groups.find(g => g === ADMIN_GROUP)) {
        navigation.replace('Root', { user })
      } 
    })

    navigation.setOptions({ headerShown: false });
    
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

  const login = async () => {
    if (!email.trim()) {
      return setErrorEmail(`The Email can't be empty`);
    } else {
      setErrorEmail();
    }
    if (!password) {
      return setErrorPassword(`The Password can't be empty`);
    } else {
      setErrorPassword();
    }

    setLoading(true);
    try {
      const user = await Auth.signIn(email.trim().toLowerCase(), password);
      const groups = user.signInUserSession.accessToken.payload['cognito:groups'] || []
      if(groups.find(g => g === ADMIN_GROUP)) {
        navigation.replace('Root', { user })
      } else {
        setErrorPassword('You are not allowed to sign in');
      }
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
      <StatusBar barStyle='dark-content' backgroundColor='#FFF'/>
      {isLoading && 
        <LoadingIndicator
          backgroundColor="#FFF"
          backDropColor="#48484888"
          text="sign in..."
        />
      }
      <Animated.Image source={wpay_logo} style={[styles.logo, { height: imageHeight, marginTop: imagePadding }]} />
      <Text h3 style={{...styles.title}}>
        sign in
      </Text>
      <Input
        inputContainerStyle={styles.input}
        label={<Text >business Email</Text>}
        placeholder='name@example.com'
        keyboardType='email-address'
        returnKeyType='next'
        errorStyle={{ color: theme.COLORS.ERROR, fontSize: 14 }}
        errorMessage={(errorEmail||'').toLowerCase()}
        value={email}
        clearButtonMode='while-editing'
        onChange={(event) => {
          setEmail(event.nativeEvent.text.trim())
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
        onSubmitEditing={login}
      />
      <Button
        title="log in"
        buttonStyle={styles.button}
        titleStyle={{fontWeight: 'bold'}}
        containerStyle={styles.buttonContainer}
        onPress={login}
      />
      <View style={styles.commandbar}>
        <TouchableOpacity onPress={() => resetPassword()}>
          <Text>forgot password?</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <Text style={{fontWeight: 'bold'}} onPress={() => navigation.navigate('Signup')}>sign up</Text>
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
  }
});

export default withTheme(Login, '');