import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Image, StyleSheet, Dimensions, TouchableOpacity,
} from 'react-native';
import { Button, Input, withTheme, Text } from 'react-native-elements';
import RadialGradient from 'react-native-radial-gradient';
import { LinearGradient } from 'expo-linear-gradient';
import EmptyGap from '../components/EmptyGap';
import BasicScreen from '../components/BasicScreen';
import ScanBracelet from '../components/ScanBracelet';
import LoadingIndicator from '../components/LoadingIndicator';
import { Auth } from 'aws-amplify';
import { apiService } from '../service';
import theme from '../constants/Theme';
const { width, height } = Dimensions.get('screen');

const scanImage = require('../assets/logo/wpay_black_b_in_w.png');

const gradientColors = {
  normal: [1, 1],
  error: ['#D36B6F', '#EB0000', '#AE0009'],
  scanned: ['#B5D49C', '#6CA53C', '#63A031'],
}

const ReceivePayment = ({
  navigation, route
}) => {

  const scrollViewRef = useRef();
  const [status, setStatus] = useState('normal');
  const [isUpdating, setUpdating] = useState(false);
  // const [user] = useState(route.params.user);
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);
  const [payer, setPayer] = useState('');
  const [reason, setReason] = useState('');
  const [braceletId, setBraceletId] = useState('');
  const [owner, setOwner] = useState()

  useEffect(() => {
    Auth.currentAuthenticatedUser()
    .then(user => {
      console.log('found user login');
      apiService.getUser(user.signInUserSession.idToken.payload.email)
      .then(({ error, data }) => {
        if (error) return;
        const users = data.body || [];
        const user = users[users.length - 1];
        console.log(user);
        setOwner(user);
      });
    })
  }, []);

  const onFound = async (wandoTagId) => {
    console.log('found bracelet:', wandoTagId);

    setUpdating(true);
    const user = await getUserProfileFromBraceletId(wandoTagId);
    console.log('found user:', user);
    if (!user) {
      setStatus('error');
      setPayer('not found user');
      setBraceletId(wandoTagId);
      setReason('this bracelet has not register to any user');
      setUpdating(false);
      return;
    }

    const walletResult = await apiService.getWalletBalance(user.wallet);
    console.log(walletResult);
    if (walletResult.error || walletResult.data.statusCode !== 200) {
      setStatus('error');
      setPayer(user.email);
      setBraceletId(wandoTagId);
      setReason(`not found user wallet. please contact us.`);
      setUpdating(false);
      return;
    }

    const wallet = walletResult.data.body;
    if (wallet.totalwandoos < amount) {
      setBalance(wallet.totalwandoos)
      setStatus('error');
      setPayer(user.email);
      setBraceletId(wandoTagId);
      setReason(`not enough user balance.`);
      setUpdating(false);
      return;
    }

    const payResult = await apiService.reduceBalance({
      idwallet: user.wallet,
      wandoos: parseInt(amount),
      description: `${user.email} pays ${amount} wandoOs to ${owner.email}`,
      destination: '',
      type: 'all',
      body: {
        information: `${wandoTagId}`
      },
    });

    if (payResult.error || payResult.data?.statusCode !== 200) {
      console.log(payResult);
      setStatus('error');
      setPayer(user.email);
      setBraceletId(wandoTagId);
      setReason(payResult.error || payResult.data.error);
      setUpdating(false);
      return;
    }
    console.log(payResult.data, payResult.data.body?.newwandoos);
    setBalance(payResult.data.body?.newwandoos || 0)

    const receiveResult = await apiService.reduceBalance({
      idwallet: owner.wallet,
      wandoos: -parseInt(amount),
      description: `${owner.email} receives ${amount} wandoOs from ${user.email}`,
      destination: '',
      type: 'all',
      body: {
        information: `${wandoTagId}`
      },
    });

    if (receiveResult.error || receiveResult.data.statusCode !== 200) {
      console.log(receiveResult);
      setStatus('error');
      setPayer(user.email);
      setBraceletId(wandoTagId);
      setReason(receiveResult.error || receiveResult.data.error);
      setUpdating(false);
      return;
    }

    setStatus('scanned')
    setPayer(user.email);
    setBraceletId(wandoTagId);
    setUpdating(false);
}

  const getUserProfileFromBraceletId = async (braceletId) => {
    //@todo: need to integrate real API that Omar will provide
    console.log('search user who has this bracelet:', braceletId)

    const result = await apiService.findBracelete(braceletId);

    console.log(result);

    if (result.error || result.data?.statusCode !== 200) {
      console.log(result);
      return null;
    }
    
    if (!result.data.data.length) {
      return null;
    }

    const [first] = result.data.data;
    
    return first.user;
  }

  return (
    <LinearGradient
      colors={(status && gradientColors[status]) || gradientColors.normal}
      style={styles.background}
    >
      {isUpdating && 
        <LoadingIndicator
          backgroundColor="#FFF"
          backDropColor="#48484888"
          text="receiving payment..."
        />
      }
      <BasicScreen
        header={
          <Text h3 multiline style={{...styles.title, color: status === 'normal' || status === 'scan' ? 'black' : 'white'}}>
            {status === 'normal' && 'enter wandoO amount & scan for payment'}
            {status === 'scan' && 'scan wristband'}
            {status === 'scanned' && 'payment complete'}
            {status === 'error' && 'payment error'}
          </Text>
        }
        scrollContainerStyle={styles.scrollView}
        scrollViewRef={scrollViewRef}
        light={status !== 'normal' && status !== 'scan'}
        style={{marginTop: 0, paddingTop: 96, backgroundColor: 'transparent'}}
      >
        {status === 'normal' && <View style={{alignItems: 'center'}}>
          <Input
            inputContainerStyle={styles.inputAmount}
            inputStyle={{fontSize: 48, textAlign: 'right', paddingHorizontal: 12}}
            placeholder='0'
            keyboardType='number-pad'
            returnKeyType='default'
            // errorStyle={styles.error}
            // errorMessage={errorEmail}
            // errorProps={{multiline: true}}
            value={amount}
            onChange={(event) => setAmount(
              (parseInt(event.nativeEvent.text.trim()) || '').toString()
            )}
            // onSubmitEditing={resetRequest}
          />
          <TouchableOpacity onPress={() => amount && setStatus('scan')}>
            <View style={[styles.scanImageFrame, amount ? styles.scanImageActive : null]}>
            <RadialGradient
              style={{
                width: width * 0.4 + 32,
                height: width * 0.4 + 32,
              }}
              colors={amount ? ['white','white','#00C04D','#00C04D','#f0f0f0'] : ['white', 'white', '#888888', '#888888', '#888888']}
              stops={[0.1,0.7,0.7,0.75,1]}
              center={[width * 0.2 + 16, width * 0.2 + 16]}
              radius={width * 0.2 + 17}
            >
              <Image source={scanImage} style={styles.scanImage}/>
            </RadialGradient>
            </View>
          </TouchableOpacity>
        </View>}
        {status === 'scan' && <View style={{alignItems: 'center'}}>
          <ScanBracelet onFound={onFound}/>
          <Button
            title="back"
            buttonStyle={styles.button}
            titleStyle={{fontWeight: 'bold'}}
            containerStyle={styles.buttonContainer}
            onPress={() => setStatus('normal')}
          />
        </View>}
        {status === 'scanned' && <>
        <EmptyGap />
        <View style={{alignItems: 'center'}}>
          <Input
            label={<Text style={{color: 'white', fontWeight: 'bold'}}>wcashless user</Text>}
            inputContainerStyle={styles.input}
            placeholder='name@example.com'
            keyboardType='email-address'
            returnKeyType='default'
            value={payer}
            editable={false}
          />
          <Input
            label={<Text style={{color: 'white', fontWeight: 'bold'}}>has transacted</Text>}
            inputContainerStyle={styles.inputAmount}
            inputStyle={{fontSize: 48, textAlign: 'right'}}
            placeholder='wandoO amount'
            keyboardType='number-pad'
            returnKeyType='default'
            value={amount}
            editable={false}
          />
          <Input
            label={<Text style={{color: 'white', fontWeight: 'bold'}}>wandoOs balance</Text>}
            inputContainerStyle={styles.inputAmount}
            inputStyle={{fontSize: 48, textAlign: 'right'}}
            placeholder='wandoO remaining'
            keyboardType='number-pad'
            returnKeyType='default'
            value={balance.toString()}
            editable={false}
          />
        </View></>}
        {status === 'error' && <>
        <EmptyGap />
        <View style={{alignItems: 'center'}}>
          <Input
            label={<Text style={{color: 'white', fontWeight: 'bold'}}>wcashless user</Text>}
            inputContainerStyle={styles.input}
            placeholder='name@example.com'
            keyboardType='email-address'
            returnKeyType='default'
            value={payer}
            editable={false}
          />
          <Input
            label={<Text style={{color: 'white', fontWeight: 'bold'}}>wandoOs transacted</Text>}
            inputContainerStyle={styles.inputAmount}
            inputStyle={{fontSize: 48, textAlign: 'right'}}
            placeholder='wandoO amount'
            keyboardType='number-pad'
            returnKeyType='default'
            value={amount}
            editable={false}
          />
          <View style={{width: width - 64, flexDirection: 'row', marginBottom: 12}}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>bracelet id: </Text>
            <Text style={{color: 'white'}}>{braceletId}</Text>
          </View>
          <View style={{width: width - 64, flexDirection: 'row'}}>
            <Text style={{color: 'white', fontWeight: 'bold'}}>reason: </Text>
            <Text style={{color: 'white'}}>{reason}</Text>
          </View>
          <Button
            title="scan again"
            buttonStyle={styles.button}
            titleStyle={{fontWeight: 'bold'}}
            containerStyle={styles.buttonContainer}
            onPress={() => setStatus('scan')}
          />
        </View></>}
      </BasicScreen>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    width: width,
    height: height
  },
  title: {
    textAlign: 'center', 
    alignSelf: 'center', 
    // marginLeft: 32,
    maxWidth: width - 64, 
  },
  scrollView: {
    paddingTop: Math.floor(Math.max(height * 0.05, 40)),
  },
  button: {
    backgroundColor: 'black',
    borderRadius: 100,
    paddingVertical: 12,
  },
  buttonContainer: {
    width: 200,
    marginTop: 40,
  },
  scanImageFrame: {
    width: width * 0.4 + 32,
    height: width * 0.4 + 32,
    padding: 0,
    borderColor: '#888888',
    borderWidth: 0,
    borderRadius: 1000,
    overflow: 'hidden',
  },
  scanImageActive: {
    borderColor: '#00C04D',
  },
  scanImage: {
    position: 'absolute',
    left: 16,
    top: 16,
    width: width * 0.4,
    height: width * 0.4,
    resizeMode: 'contain',
    margin: 0,
  },
  input: {
    width: width * 0.8,
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    paddingLeft: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  inputAmount: {
    width: width * 0.8,
    height: 80,
    backgroundColor: 'white',
    borderColor: '#ccc',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 8,
    paddingLeft: 8,
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'right'
  },
  wave: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 1000,
    backgroundColor: '#000000'
  }
});

export default withTheme(ReceivePayment, '');