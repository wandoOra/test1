import React, { useState, useEffect, useContext, useRef } from 'react';
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';
import { 
  Alert, View, Image, StyleSheet, ScrollView,
  Dimensions, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback, TouchableOpacity,
} from 'react-native';
import { Button, Input, withTheme, Text } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Wave } from 'react-native-animated-spinkit';
import DatePicker, { getFormatedDate } from 'react-native-modern-datepicker';
import LoadingIndicator from '../components/LoadingIndicator';

import { apiService } from '../service';

import Header from '../components/Header';
import theme from '../constants/Theme';
const scanImage = require('../assets/scan.jpg');
const { width, height } = Dimensions.get('screen');

const BrtaceletContext = React.createContext({});

const Bracelet = ({
  navigation,
  route
}) => {

  const scrollViewRef = useRef();
  const barcodeInputRef = useRef();
  const nameInputRef = useRef();

  const [bracelet, setBracelet] = useState(route.params.bracelet);
  const [isScan, showScan] = useState(false);

  const [isDatePicker, showDatePicker] = useState();
  const [selectedDate, setSelectedDate] = useState();
  const [editingField, setEditingField] = useState();
  const [pickerOption, setPickerOption] = useState({});

  const [braceletId, setBraceletId] = useState('');
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    !bracelet && showScan(true);

    if (bracelet) {
      setBraceletId(bracelet.id);
      setBarcode(bracelet.barCode);
      setName(bracelet.braceletOwner);
      setStartDate(bracelet.dateIn);
      setEndDate(bracelet.dateOut);
    }

    enableNFC();
  }, [bracelet]);

  const enableNFC = async () => {
    if (NfcManager) {
      console.log('nfc available')
    } else {
      Alert.alert(
        "Wandoora Bracelet",
        "\nNFC is not available. Please active it on your phone and allow NFC permission for the app.",
        [
          { text: "OK", onPress: () => goBack() }
        ],
        { cancelable: false }
      );
      return console.log('nfc not available')
    }

    const isSupported = await NfcManager.isSupported();
    if (!isSupported) {
      Alert.alert(
        "Wandoora Bracelet",
        "\nYour device does not support NFC.",
        [
          { text: "OK", onPress: () => goBack() }
        ],
        { cancelable: false }
      );
      console.log('nfc not supported')
      return;
    } else {
      console.log('nfc supported')
    }
  
    await NfcManager.start();


    const isEnabled = await NfcManager.isEnabled();
    if (!isEnabled) {
      Alert.alert(
        "Wandoora Bracelet",
        "\nNFC is not available. Please active it on your phone and allow NFC permission for the app.",
        [
          { text: "OK", onPress: () => goBack() }
        ],
        { cancelable: false }
      );
      return console.log('nfc not activated')
    } else {
      console.log('nfc activated')
    }
  }

  const context = useContext(BrtaceletContext);

  useEffect(() => {

    const b = {
      id: braceletId,
      barCode: barcode,
      wandooerName: bracelet?.wandooerName || route.params.user.email,
      braceletOwner: name,
      dateIn: startDate,
      dateOut: endDate,
      'enabled': true
    };
    b.idbraceletowner && (b.idbraceletowner = bracelet.idbraceletowner);


    context.bracelet = b;

  }, [braceletId, barcode, name, startDate, endDate]);

  useEffect(() => {
    if (isScan) {
      readNdef()
      .then(tag => {
        tag && initNewBracelet(tag.id || tag || 'testTagId');
        showScan(false);
      })
      .catch((err) => {
        showScan(false);
        Alert.alert(
          "Wandoora Bracelet",
          "\nError occured.",
          [
            { text: "OK", onPress: () => goBack() }
          ],
          { cancelable: false }
        );
      })
    }
  }, [isScan])

  const initNewBracelet = (tag) => {
    if (!tag) {
      Alert.alert(
        "Wandoora Bracelet",
        "\nNothing scanned any bracelet.",
        [
          { text: "OK", onPress: () => goBack() }
        ],
        { cancelable: false }
      );
      return;
    }
    if (route.params.bracelets && route.params.bracelets.find(b => b.id === tag)) {
      Alert.alert(
        "Wandoora Bracelet",
        "\nBracelet already registered previously.",
        [
          { text: "OK", onPress: () => goBack() }
        ],
        { cancelable: false }
      );
      return;
    }
    const user = route.params.user;
    setBracelet({
      wandooerName: user.email,
      id: tag,
      barCode: '',
      braceletOwner: user.name,
      dateIn: formatDate(new Date(), '/', true),
      dateOut: formatDate(new Date(), '/', true),
      isNew: true,
    });
    barcodeInputRef.current.focus();
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

  const showEditDate = (editDate, fieldName, min, max) => {
    setSelectedDate(editDate.split('/').reverse().join('-'));
    setEditingField(fieldName);
    showDatePicker(true);
    let opt = {};
    min && (opt.minimumDate = min.split('/').reverse().join('-'));
    max && (opt.maximumDate = max.split('/').reverse().join('-'));
    setPickerOption(opt);
  }

  const doneEditDate = () => {
    showDatePicker(false);
    const date = selectedDate.split('/').reverse().join('/');
    if (editingField === 'start') {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
  }

  const readNdef = () => {
    const cleanUp = () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
      NfcManager.setEventListener(NfcEvents.SessionClosed, null);
    };
  
    return new Promise((resolve) => {
      let tagFound = null;
  
      NfcManager.setEventListener(NfcEvents.DiscoverTag, (tag) => {
        tagFound = tag;
        resolve(tagFound);
        // NfcManager.setAlertMessageIOS('NDEF tag found');
        NfcManager.unregisterTagEvent().catch(() => 0);
      });
  
      NfcManager.setEventListener(NfcEvents.SessionClosed, () => {
        cleanUp();
        if (!tagFound) {
          resolve();
        }
      });
  
      NfcManager.registerTagEvent();
    });
  }

  const goBack = () => {
    showScan(false);
    navigation.goBack();
  }

  const goBackWithData = (isReplace) => {
    showDatePicker(false);
    isReplace && (context.bracelet.isReplace = isReplace);
    route.params.onReturn(context.bracelet);
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : null}
      style={styles.contentView}
      enabled
    >
      {isScan && 
        <LoadingIndicator
          backgroundColor="#FFF"
          backDropColor="#48484888"
        >
          <View>
            <Image source={scanImage} style={styles.scanImage}/>
            <Wave size={48} color='#2F2F2F' style={{alignSelf: 'center', position: 'absolute', top: 130}}/>
            <Text style={{textAlign: 'center', marginTop: 64}}>Hold the bracelet close to your phone.</Text>

            <Button
              title="Cancel"
              buttonStyle={styles.button}
              containerStyle={styles.buttonContainer}
              onPress={goBack}
            />
          </View>
        </LoadingIndicator>
      }
      {
        isDatePicker &&
        <LoadingIndicator
          backgroundColor="#FFF"
          backDropColor="#48484888"
          onBackdropPress={() => showDatePicker(false)}
        >
          <DatePicker
            mode='calendar'
            current={selectedDate}
            selected={selectedDate}
            onSelectedChange={date => setSelectedDate(date)}
            style={{width: 310, height: 290}}
            {...pickerOption}
          />
          <View style={{flexDirection: 'row', marginBottom: 50}}>
            <Button
              title="Cancel"
              buttonStyle={styles.button}
              containerStyle={{...styles.buttonContainer, marginRight: 16}}
              onPress={() => showDatePicker(false)}
            />
            <Button
              title="Set"
              buttonStyle={styles.buttonPrimary}
              containerStyle={styles.buttonContainer}
              onPress={doneEditDate}
            />
          </View>
        </LoadingIndicator>
      }
      <ScrollView ref={scrollViewRef} style={styles.scrollView}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerView}>
            <Input
              editable={false}
              label={<Text >Bracelet ID</Text>}
              value={braceletId}
            />
            <Input
              ref={barcodeInputRef}
              label={<Text >Barcode</Text>}
              value={barcode}
              returnKeyType='next'
              onChange={(event) => { setBarcode(event.nativeEvent.text) }}
              onSubmitEditing={() => nameInputRef.current.focus()}
            />
            <Input
              ref={nameInputRef}
              label={<Text >Name</Text>}
              value={name}
              returnKeyType='next'
              onChange={(event) => { setName(event.nativeEvent.text) }}
              onSubmitEditing={() => nameInputRef.current.focus()}
            />
            <View style={{position: 'relative', width: '100%'}}>
              <Input
                editable={false}
                label={<Text >Start Date</Text>}
                value={startDate}
              />
              <TouchableOpacity onPress={() => showEditDate(startDate, 'start', null, endDate)} style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}>
                <View />
              </TouchableOpacity>
            </View>
            <View style={{position: 'relative', width: '100%'}}>
              <Input
                editable={false}
                label={<Text >End Date</Text>}
                value={endDate}
              />
              <TouchableOpacity onPress={() => showEditDate(endDate, 'end', startDate, null)} style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}>
                <View />
              </TouchableOpacity>
            </View>
            {route.params.bracelet &&
              <View style={{width: '100%', alignItems: 'center'}}>
                <Button
                  title="Update"
                  buttonStyle={{...styles.buttonPrimary}}
                  containerStyle={{...styles.buttonContainer, width: 300}}
                  onPress={() => goBackWithData()}
                />
              </View>
            }
            {!route.params.bracelet &&
              <View style={{width: '100%', alignItems: 'center'}}>
                <Button
                  title="Bind new bracelet"
                  buttonStyle={{...styles.buttonPrimary}}
                  containerStyle={{...styles.buttonContainer, width: 300}}
                  onPress={() => goBackWithData()}
                />
                <Text style={{marginTop: 20}}>Or</Text>
                <Button
                  title="Replace lost Bracelet"
                  buttonStyle={{...styles.buttonWarn}}
                  containerStyle={{...styles.buttonContainer, width: 300, marginTop: 20}}
                  onPress={() => goBackWithData(true)}
                />
              </View>
            }
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  contentView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 96,
  },
  scrollView: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 45,
  },
  innerView: {
    flex: 1,
    alignItems: 'center',
    width: width * 0.9,
    paddingBottom: 60,
  },
  button: {
    backgroundColor: theme.COLORS.ICON,
    borderRadius: 3,
  },
  buttonPrimary: {
    backgroundColor: theme.COLORS.PRIMARY,
    borderRadius: 3,
  },
  buttonWarn: {
    backgroundColor: theme.COLORS.WARNING,
    borderRadius: 3,
  },
  buttonContainer: {
    alignSelf: 'center',
    width: 100,
    marginTop: 50,
  },
  scanImage: {
    width: width * 0.5,
    marginLeft: width * 0.01,
    height: 150,
    resizeMode: 'contain',
    transform: [
      {rotateY: "180deg"}
    ]
  }
});

export default withTheme(Bracelet, '');