import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { Button, Input, withTheme, Text } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoadingIndicator from '../components/LoadingIndicator';
import BasicScreen from '../components/BasicScreen';

import { apiService } from '../service';

import theme from '../constants/Theme';
const { width, height } = Dimensions.get('screen');

const SearchUser = ({
  navigation
}) => {

  const scrollViewRef = useRef();

  const [email, setEmail] = useState('');
  const [error, setError] = useState();
  const [user, setUser] = useState();
  const [bracelets, setBracelets] = useState();
  const [searching, setSearching] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);

  useEffect(() => {
    const bs = bracelets; //?.length ? bracelets : items;
    user && bracelets &&
    navigation.replace('PairBracelet', { user: user, bracelets: bs });
  }, [bracelets]);

  const findWandooer = async () => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!email || !email.trim()) {
      return setError('Enter user email.');
    } else if (!re.test(email)) {
      return setError('Enter a valid email.');
    }

    setSearching(true);

    {
      const result = await apiService.getUser(email);
      const {error, data} = result;
      if (error) {
        setSearching(false);
        setError('Hmmmm! Something went wrong, Please try again.');
        return;
      } else {
        const users = data.body || [];
        const user = users[users.length - 1];
        console.log(user);
        setUser(user);
        if (!user) {
          setSearching(false);
          setUserNotFound(true);
          setError('User not found.');
          return;
        }
      }
    }

    {
      const result = await apiService.getBraceletByUser(email);
      const { error, data } = result;

      setSearching(false);

      if (error) {
        setError('Hmmmm! Something went wrong, Please try again.');
      } else {
        const { bracelets } = data;
        if (bracelets) {
          const bs = bracelets.map(b => {
            b.enabled = b.enabled === 'true';
            return b;
          });
          setBracelets(bs);
          setUserNotFound(false);
        } else {
          setUserNotFound(true);
          setError('User not found');
        }
      }
    }
  }

  return (
    <View style={{width: width, height: height, backgroundColor: '#fff'}}>
    <BasicScreen
      header={
        <>
          {searching && <LoadingIndicator text="searching..." backgroundColor="#F9F9F9" backDropColor="#48484888" />}
          {!searching && !userNotFound && <Text h3 style={{...styles.title}}>search user</Text>}
          {searching && <Text h3 style={{...styles.title}}>searching...</Text>}
          {userNotFound && <Text h3 style={{...styles.title, color: theme.COLORS.ERROR}}>user not found</Text>}
        </>
      }
      scrollContainerStyle={styles.scrollView}
      scrollViewRef={scrollViewRef}
    >
      <Input
        inputContainerStyle={styles.input}
        label={<Text >search by email</Text>}
        placeholder='user@email.com'
        rightIcon={<Icon name='search' size={24} color='black' style={{marginRight: 8}}/>}
        keyboardType='email-address'
        returnKeyType='search'
        errorStyle={{ color: theme.COLORS.ERROR, fontSize: 14 }}
        errorMessage={(error||'').toLowerCase()}
        value={email}
        clearButtonMode='while-editing'
        // onFocus={() => {
        //   setTimeout(() => scrollViewRef.current.scrollTo({y: 290, animated: true}))
        // }}
        onChange={(event) => {
          setEmail(event.nativeEvent.text.trim())
        }}
        onSubmitEditing={findWandooer}
      />
      <Button
        title="search"
        buttonStyle={styles.button}
        titleStyle={{fontWeight: 'bold'}}
        containerStyle={styles.buttonContainer}
        onPress={findWandooer}
      />
    </BasicScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    alignSelf: 'center',
  },
  scrollView: {
    paddingTop: Math.floor(Math.max(height * 0.1, 64)) + 45,
  },
  input: {
    borderColor: 'black',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    paddingLeft: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  button: {
    backgroundColor: 'black',
    borderRadius: 100,
    paddingVertical: 12,
  },
  buttonContainer: {
    width: 300,
    marginTop: 20,
  },
});

export default withTheme(SearchUser, '');
