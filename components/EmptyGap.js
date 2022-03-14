import React from 'react';
import {
  StyleSheet, View
} from 'react-native';

class EmptyGap extends React.Component {

  render() {
    return (
      <View style={styles.container}>
        <View style={{width: '100%', height: 100}}></View>
      </View>
    );
  }
}

export default EmptyGap;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 1,
    flexGrow: 1,
    minHeight: 0,
  }
});