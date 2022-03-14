import React, { useState, useEffect, useRef } from 'react';
import {
  View, Image, StyleSheet, Dimensions,
} from 'react-native';
import { Button, Avatar, withTheme, Text } from 'react-native-elements';
import { LinearGradient } from 'expo-linear-gradient';
import { Wave } from 'react-native-animated-spinkit';
import moment from 'moment';
import EmptyGap from '../components/EmptyGap';
import BasicScreen from '../components/BasicScreen';
import LoadingIndicator from '../components/LoadingIndicator';
import ScanBracelet from '../components/ScanBracelet';
import { apiService } from '../service';

const { width, height } = Dimensions.get('screen');

const scanImageWhite = require('../assets/scan-white.png');
const scanImageBlack = require('../assets/scan-black.png');

const gradientColors = {
  normal: ['#FFFFFF', '#FFFFFF'],
  error: ['#D36B6F', '#EB0000', '#AE0009'],
  paired: ['#B5D49C', '#6CA53C', '#63A031'],
  wave: ['#70D3F5', '#FFFFFF', '#FFFFFF', '#FFFFFF']
}

const PairBracelet = ({
  navigation, route
}) => {

  const scrollViewRef = useRef();
  const [user] = useState(route.params.user);
  const [bracelets, setBracelets] = useState(route.params.bracelets || []);
  const [scanedTag, setScanedTag] = useState('');

  const [isPairing, setPairing] = useState(false);
  const [status, setStatus] = useState('normal');
  const [message, setMessage] = useState('');


  const goBack = () => {
    navigation.replace('Menu');
    // navigation.goBack();
  }

  const onFound = (wandoTagId) => {
    const existed = bracelets.find(b => b.id === wandoTagId);
    console.log(`wandoTagId: `, wandoTagId)
    console.log(`scanedTag: `, setScanedTag)
    setScanedTag(wandoTagId);
    if (existed) {
      setStatus('error');
      setMessage('Wristband ID already registered to this user.'.toLowerCase())
    } else {
      const fromDate = new Date();
      const toDate = new Date();
      toDate.setDate(toDate.getDate() + 365);


      const bracelet = {
        wandooerName: user.email,
        id: wandoTagId,
        barCode: '',
        braceletOwner: user.name,
        dateIn: formatDate(fromDate, '-', false),
        dateOut: formatDate(toDate, '-', false),
        isNew: true,
      }
      updateBracelets([...bracelets, bracelet])
    }
  }

  const updateBracelets = async (bs) => {
    setPairing(true);
    {
      const result = await apiService.postBraceletByUser(user.email, user.iduserw, bs);
      console.log(result);
    }
    {
      const result = await apiService.getBraceletByUser(user.email);
      const { error, data } = result;
      const { bracelets } = data;

      setBracelets(bracelets.map(b => {
        b.enabled = b.enabled === 'true';
        return b;
      }).map(i => ({key: i.id, ...i})) || []);
      console.log('updated bracelets');
      console.log(bracelets);

      setStatus('paired');
    }
    setPairing(false);
    playSound();
  }

  const formatDate = (date, delimiter = '-', isReverse = false) => {
    let d = date,
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return isReverse ? [day, month, year].join(delimiter) : [year, month, day].join(delimiter);
  }

  return (
    <LinearGradient
      colors={(status && gradientColors[status]) || gradientColors.normal}
      style={styles.background}
    >
      {isPairing &&
        <LoadingIndicator
          backgroundColor="#FFF"
          backDropColor="#48484888"
          text="pairing..."
        />
      }
      <BasicScreen
        header={
          <>
            <Text h3 style={{...styles.title, color: status === 'normal' ? 'black' : 'white'}}>
              {status === 'normal' && 'pair wristband'}
              {status === 'error' && 'pairing failed'}
            </Text>
          </>
        }
        scrollContainerStyle={styles.scrollView}
        scrollViewRef={scrollViewRef}
        light={status!=='normal'}
        style={{marginTop: 0, paddingTop: status !== 'paired' ? 96 : 36, backgroundColor: 'transparent'}}
      >
        {status !== 'paired' && <EmptyGap />}
        {status === 'normal' && <ScanBracelet onFound={onFound} onFailed={goBack}/>}
        {status === 'error' &&
        <View style={{alignItems: 'center'}}>
          <Image source={scanImageWhite} style={styles.scanImage}/>
          {status === 'normal' && <>
            <Wave size={48} color={'white'} style={{alignSelf: 'center', position: 'absolute', top: 130}}/>
            <Text style={{textAlign: 'center', marginTop: 64, color: 'white'}}>Pair wristband.</Text>
          </>}
          {status === 'error' && <>
            {scanedTag && <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 32}}>
              <Text style={{fontWeight: 'bold', color: 'white'}}>Wristband ID: </Text>
              <Text style={{color: 'white'}}>{scanedTag}</Text>
            </View>}
            <Text style={{textAlign: 'center', marginTop: scanedTag ? 16 : 32, color: 'white'}}>{message || ''}</Text>
          </>}
        </View>}
        {status === 'paired' && <View style={{alignItems: 'center'}}>
          {/* <Avatar
            rounded
            size="xlarge"
            source={{ uri: 'https://s3.amazonaws.com/uifaces/faces/twitter/ladylexy/128.jpg' }}
          /> */}
          <Text style={{textAlign: 'center', fontSize: 36, marginTop: 16, color: 'white'}}>{user?.name}</Text>
          <View style={{flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-start', marginTop: 16}}>
            <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: 8}}>
              <Text style={{fontWeight: 'bold', color: 'white'}}>Member since: </Text>
              <Text style={{color: 'white'}}>{moment(user.registerdate).format('LL')}</Text>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: 16}}>
              <Text style={{fontWeight: 'bold', color: 'white'}}>Member ID: </Text>
              <Text style={{color: 'white'}}>{user.idaccount}</Text>
            </View>
            <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start', marginBottom: 8}}>
              <Text style={{fontWeight: 'bold', color: 'white'}}>Wristband ID: </Text>
              <Text style={{color: 'white'}}>{scanedTag}</Text>
            </View>
          </View>
        </View>}
        {status !== 'normal' &&
          <Button
            title="pair again"
            buttonStyle={styles.button}
            titleStyle={{fontWeight: 'bold'}}
            containerStyle={styles.buttonContainer}
            onPress={() => {
              setStatus('normal');
            }}
          />
        }
        <EmptyGap />
        <EmptyGap />
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
    // marginLeft: 32
  },
  scrollView: {
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
  scanImage: {
    width: width * 0.5,
    marginLeft: width * 0.01,
    height: 150,
    resizeMode: 'contain',
    transform: [
      {rotateY: "180deg"}
    ]
  },
  wave: {
    position: 'absolute',
    width: width * 0.5,
    height: width * 0.5,
    borderRadius: 1000,
    backgroundColor: '#e0eaf0'
  }
});

export default withTheme(PairBracelet, '');
