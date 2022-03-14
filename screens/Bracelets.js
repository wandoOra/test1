import React, { useState, useEffect, useRef } from 'react';
import {
  Alert, View, Image, StyleSheet, ScrollView,
  Dimensions, KeyboardAvoidingView, Platform, Keyboard,
  TouchableWithoutFeedback, TouchableOpacity, TouchableHighlight
} from 'react-native';
import { Button, Input, withTheme, Text } from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import LoadingIndicator from '../components/LoadingIndicator';
import { SwipeListView, SwipeRow } from 'react-native-swipe-list-view';

import { apiService } from '../service';

import theme from '../constants/Theme';
const logo = require('../assets/logo.png');
const { width, height } = Dimensions.get('screen');


const Bracelets = ({
  navigation,
  route
}) => {
  const [user] = useState(route.params.user);
  const [bracelets, setBracelets] = useState(
    (route.params.bracelets || []).map(i => ({key: i.id, ...i}))
  );
  const [isUpdating, setUpdating] = useState(false);

  const onAddNew = () => {
    navigation.navigate('Bracelet', {
      user: user,
      bracelets,
      onReturn: (item) => {
        updateBracelets([...bracelets, item]);
      }
    });
  }

  const onEdit = (bracelet) => {
    navigation.navigate('Bracelet', {
      user: user,
      bracelets,
      bracelet,
      onReturn: (item) => {
        const edited = bracelets.find(b => b.id === item.id);
        if (edited) {
          edited.barCode = item.barCode;
          edited.braceletOwner = item.braceletOwner;
          edited.dateIn = item.dateIn;
          edited.dateOut = item.dateOut;
          edited.enabled = item.enabled;
          console.log('edited', bracelets)
          updateBracelets([...bracelets]);
        }
      }
    });
  }

  const onDelete = (item) => {
    if (item.userw_iduserw) {
      Alert.alert(
        "Wandoora Bracelet",
        "\nAre you sure to unsubscribe this bracelet?",
        [
          { text: "No", onPress: () => {} },
          { text: "Yes", onPress: () => {
            item.enabled = false;
            setBracelets([...bracelets]);
            updateBracelets([...bracelets]);
          }}
        ],
        { cancelable: true }
      );
    } else {
      const idx = bracelets.findIndex(b => b.id === item.id);
      idx >= 0 && bracelets.splice(idx, 1);
      setBracelets([...bracelets]);
      updateBracelets([...bracelets]);
    }
  }

  const updateBracelets = async (bs) => {
    setUpdating(true);
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
    }
    setUpdating(false);
  }

  const BraceletItem = ({item}) => (
    <View style={{paddingVertical: 10, paddingHorizontal: 24, ...styles.fullHeight, ...styles.fullWidth}}>
      <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 8}}>
        <Icon name={item.enabled ? 'check' : 'close'} size={34} style={[{marginRight: 8}, item.enabled ? styles.textSuccess : styles.textMuted]} />
        <Text h4 style={[{fontWeight: 'bold'}, item.enabled ? styles.textSuccess : styles.textMuted]}>{item.id}</Text>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 6, paddingLeft: 36}}>
        <Icon name='barcode' size={24} color='black' style={{marginRight: 8}} />
        <Text style={[{}, item.enabled ? styles.textSuccess : styles.textMuted]}>Barcode: </Text>
        <Text style={[{fontWeight: 'bold'}, item.enabled ? styles.textSuccess : styles.textMuted]}>{item.barCode}</Text>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center',marginBottom: 6, paddingLeft: 36}}>
        <Icon name='user' size={24} color='black' style={{marginRight: 8}} />
        <Text style={[{}, item.enabled ? styles.textSuccess : styles.textMuted]}>Name: </Text>
        <Text style={[{fontWeight: 'bold'}, item.enabled ? styles.textSuccess : styles.textMuted]}>{item.braceletOwner}</Text>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 6, paddingLeft: 36}}>
        <Icon name='calendar' size={24} color='black' style={{marginRight: 8}} />
        <Text style={[{}, item.enabled ? styles.textSuccess : styles.textMuted]}>Start date: </Text>
        <Text style={[{fontWeight: 'bold'}, item.enabled ? styles.textSuccess : styles.textMuted]}>{item.dateIn}</Text>
      </View>
      <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 6, paddingLeft: 36}}>
        <Icon name='calendar' size={24} color='black' style={{marginRight: 8}} />
        <Text style={[{}, item.enabled ? styles.textSuccess : styles.textMuted]}>End date: </Text>
        <Text style={[{fontWeight: 'bold'}, item.enabled ? styles.textSuccess : styles.textMuted]}>{item.dateOut}</Text>
      </View>
    </View>
  )

  return (
    <View style={styles.contentView}>
      {isUpdating &&
        <LoadingIndicator
          backgroundColor="#FFF"
          backDropColor="#48484888"
          text="Updating..."
        />
      }
      <View style={{padding: 24, paddingBottom: 12, ...styles.fullWidth}}>
        <Text h4 style={{marginBottom: 8, fontWeight: 'bold', textAlign: 'right', ...styles.textPrimary}}>{user?.name}</Text>
        <Text style={{marginBottom: 36, textAlign: 'right'}}>{user?.email}</Text>
        <Text h3 style={{fontWeight: 'bold', ...styles.textPrimary}}>Bracelet List</Text>
      </View>
      <View style={styles.listContainer}>
        <SwipeListView
          data={bracelets}
          disableHiddenLayoutCalculation={true}
          renderItem={ (data, rowMap) => (
            <SwipeRow
              leftOpenValue={0}
              rightOpenValue={data.item.enabled ? -170 : 0}
              style={styles.row}
            >
              <View style={styles.rowBack}>
                {data.item.enabled &&
                  <>
                    <View>
                      <TouchableOpacity
                        style={{...styles.backRightBtn}}
                        onPress={() => {rowMap[data.item.key].closeRow(); onEdit(data.item)}}
                      >
                        <Text style={styles.textWhite}>Edit</Text>
                      </TouchableOpacity>
                    </View>
                    <View>
                      <TouchableOpacity
                        style={{...styles.backRightBtn, ...styles.backRightRed}}
                        onPress={() => {rowMap[data.item.key].closeRow(); onDelete(data.item)}}
                      >
                        <Text style={styles.textWhite}>{data.item.isNew ? 'Delete' : 'Unsubscribe'}</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                }
                {!data.item.enabled &&
                  <View style={{...styles.backTerminated}}>
                    <Text h1 style={styles.textBrightMuted}>T e r m i n a t e d</Text>
                  </View>
                }
                <View style={styles.shadowOverlay}></View>
                <View style={{...styles.shadowOverlay, ...styles.shadowOverlayBottom}}></View>
              </View>

              <View style={[styles.rowFront, data.item.enabled ? null : styles.rowOld]}>
                <BraceletItem item={data.item}/>
              </View>
            </SwipeRow>
          )}
        />
      </View>
      <TouchableOpacity style={styles.favButton} onPress={onAddNew}>
        <View style={styles.favButtonInner}>
            <Text h2 style={{color: 'white'}}>+</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  contentView: {
    flex: 1,
    backgroundColor: theme.COLORS.WHITE,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: 96,
    paddingTop: 0,
  },
  listContainer: {
    borderTopColor: theme.COLORS.INPUT,
    borderTopWidth: 1,
    backgroundColor: theme.COLORS.INPUT,
    width: '100%',
  },
  fullWidth: {
    width: '100%'
  },
  fullHeight: {
    height: '100%'
  },
  row: {
    width: '100%',
    height: 184,
    overflow: 'hidden',
    marginBottom: 1,
    backgroundColor: '#FFFFFF'
  },
  rowOld: {
    backgroundColor: '#F0F0F0'
  },
  oddRow: {
    backgroundColor: theme.COLORS.WHITE,
    color: '#808080'
  },
  rowFront: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'black',
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 4,
    shadowOpacity: 0.4,
    elevation: 3,
  },
  rowBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: theme.COLORS.INPUT,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  shadowOverlay: {
    position: 'absolute',
    top: -10,
    right: 0,
    width: '100%',
    height: 10,
    zIndex: 10,
    backgroundColor: theme.COLORS.WHITE,
    shadowColor: 'black',
    shadowOffset: { width: 2, height: 0 },
    shadowRadius: 4,
    shadowOpacity: 0.4,
    elevation: 3,
  },
  shadowOverlayBottom: {
    top: 'auto',
    bottom: -13
  },
  backTerminated: {
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backRightBtn: {
    flexDirection: 'column',
    width: 85,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.COLORS.INFO,
  },
  backRightRed: {
    backgroundColor: theme.COLORS.ERROR,
  },
  backRightGray: {
    backgroundColor: theme.COLORS.BLOCK,
  },
  favButton: {
    position: 'absolute',
    zIndex: 10,
    width: 64,
    height: 64,
    right: 32,
    bottom: 32,
  },
  favButtonInner: {
    borderRadius: 32,
    shadowColor: 'black',
    shadowOffset: { width: 2, height: 2 },
    shadowRadius: 4,
    shadowOpacity: 0.4,
    elevation: 3,
    backgroundColor: theme.COLORS.LABEL, paddingTop: 4, width: '100%', height: '100%', alignItems: 'center'
  },
  textWhite: {
    color: 'white'
  },
  textPrimary: {
    color: theme.COLORS.PRIMARY
  },
  textMuted: {
    color: '#808080'
  },
  textBrightMuted: {
    color: '#D0D0D0'
  },
  textSuccess: {
    color: theme.COLORS.SUCCESS
  },
  textBlack: {
    color: 'black'
  }
});


export default withTheme(Bracelets, '');
