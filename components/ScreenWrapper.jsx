import { SafeAreaView, StatusBar, View } from 'react-native';

const ScreenWrapper = ({ children, bg }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ flex: 1, marginTop: StatusBar.currentHeight }}>
        {children}
      </View>
    </SafeAreaView>
  );
};

export default ScreenWrapper;
