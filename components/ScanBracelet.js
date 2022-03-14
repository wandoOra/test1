import React, { useState, useEffect, useRef } from 'react';
import { 
  Alert, View, Image, StyleSheet,
  Dimensions, Animated, Easing,
} from 'react-native';
import { Button, Input, withTheme, Text } from 'react-native-elements';
import { Audio } from 'expo-av';
import { Wave } from 'react-native-animated-spinkit';
import NfcManager, { NfcEvents } from 'react-native-nfc-manager';
import NfcProxy from '../NfcProxy';

const { width, height } = Dimensions.get('screen');
const scanImageBlack = require('../assets/scan-black.png');


const ScanBracelet = ({
  onFound,
  onFailed,
}) => {

  const [sound, setSound] = useState();

  async function playSound() {
    const { sound } = await Audio.Sound.createAsync(
       require('../assets/sound/diong.mp3')
    );
    setSound(sound);
    await sound.playAsync(); 
  }

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync(); }
      : undefined;
  }, [sound]);

  let anime = useRef(new Animated.Value(0)).current;
  
  const animate = () => {
    anime.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(anime, {
          toValue: 1,
          duration: 10,
          useNativeDriver: false,
        }),
        Animated.timing(anime, {
          toValue: 0,
          duration: 2000,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        })
      ]),
      { iterations: -1 }
    ).start()
  };
  const opacity = anime.interpolate({
    inputRange: [0, 1],
    outputRange: [0.0, 0.5]
  });
  const size = anime.interpolate({
    inputRange: [0, 1],
    outputRange: [width * 0.8, width * 0.5 - 40]
  });
  const top = anime.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 30]
  });
  const animatedStyles = [
    styles.wave,
    { opacity, top, width: size, height: size }
  ];

  useEffect(() => {
    animate();
    async function initNfc() {
      try {
        const success = await NfcProxy.init();

        if (!success) {
          Alert.alert(
            'wcashless',
            "\nYour device does not support NFC.".toLowerCase(),
            [
              { text: "ok", onPress: () => onFailed() }
            ],
            { cancelable: false }
          );
          return;
        }
        
        readNFC();

      } catch (ex) {
        console.warn(ex);
        Alert.alert(
          'wcashless',
          "\nYour device is failed to init NFC.".toLowerCase(),
          [
            { text: "ok", onPress: () => onFailed() }
          ],
          { cancelable: false }
        );
      }
    }

    initNfc();

    return () => {
      NfcManager.setEventListener(NfcEvents.SessionClosed, () => {
        NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
        NfcManager.setEventListener(NfcEvents.SessionClosed, null);
      });
    }
  }, [])

  const readNFC = async () => {
    const enabled = await NfcProxy.isEnabled()
    if (!enabled) {
      Alert.alert(
        'wcashless',
        "\nNFC is not available. Please active it on your phone and allow NFC permission for the app.".toLowerCase(),
        [
          { text: "ok", onPress: () => onFailed() }
        ],
        { cancelable: false }
      );
      return;
    }
    const tag = await NfcProxy.readTag();
    const rawTagId = tag?.id || tag;
    if (rawTagId) {
      const tagId = `${rawTagId}`
      onReadNFC(tagId);
    } else {
      setStatus('error');
    }
  }

  const onReadNFC = (tagId) => {
    playSound();
    const wandoTagId = `${tagId}9000`;
    onFound && onFound(wandoTagId);
  }

  return (
    <View style={{alignItems: 'center'}}>
      <Animated.View style={animatedStyles}>
      </Animated.View>
      <Image source={scanImageBlack} style={styles.scanImage}/>
      <Wave size={48} color={'#2F2F2F'} style={{alignSelf: 'center', position: 'absolute', top: 130}}/>
      <Text style={{textAlign: 'center', marginTop: 64, color: 'black'}}>hold the bracelet close to your phone.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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

export default withTheme(ScanBracelet, '');