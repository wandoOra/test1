import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { Overlay } from 'react-native-elements';
import { Swing } from 'react-native-animated-spinkit'

const { height, width } = Dimensions.get('screen');

import theme from '../constants/Theme';


export default class LoadingIndicator extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      error: false,
    };
  }

  render() {
    const { color, textColor, backgroundColor, backDropColor, text, children, width, ...props } = this.props;
    return (
      <Overlay
        backdropStyle={{backgroundColor: backDropColor || '#4A4A4A'}}
        overlayStyle={{...styles.shadow, backgroundColor: backgroundColor || '#FFFFFF'}}
        {...props}
      >
        {/* <View flex style={{...styles.loading, backgroundColor: backDropColor || '#F9F9F9'}}> */}
          <View style={[styles.panel, width ? {width: width} : null]}>
            {
              children ?
              <>
                {children} 
              </>
              :
              <>
                <Swing size={48} color={ color || '#2F2F2F' } style={{alignSelf: 'center', marginBottom: 12}}/>
                {
                  text &&
                  <Text color={ textColor || '#161D4D' } size={24} style={{ paddingHorizontal: theme.SIZES.BASE, paddingVertical: theme.SIZES.BASE * 2, textAlign: 'center' }}>
                    {text}
                  </Text>
                }
              </>
            }
          </View>
        {/* </View> */}
      </Overlay>
    );
  }
}

const styles = StyleSheet.create({

  loading: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: width,
    height: height,
    zIndex: 10,
    paddingTop: height / 4,
  },
  shadow: {
    borderRadius: 12,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 16,
    shadowOpacity: 0.3,
    elevation: 3,
  },
  panel: {
    width: '70%',
    padding: 36,
    borderRadius: 12,
    alignItems: 'center',
  }
});
