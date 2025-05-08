import React from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWrapper = ({children, bg}) => {
    const {top} = useSafeAreaInsets();
    const paddingTop = top>0 ? top+10: 40;

  return (
    <View style={{flex: 1, paddingTop: paddingTop, backgroundColor: bg}}>
      <Text>{children}</Text>
    </View>
  )
}

export default ScreenWrapper