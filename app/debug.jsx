import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button, View } from 'react-native';
import { supabase } from '../lib/supabase';

const DebugScreen = () => {
  const checkStorage = async () => {
    const keys = await AsyncStorage.getAllKeys();
    console.log('Storage keys:', keys);
    
    const session = await AsyncStorage.getItem('supabase.auth.token');
    console.log('Supabase session:', session);
    
    const current = supabase.auth.session();
    console.log('Current session:', current);
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Check Storage" onPress={checkStorage} />
    </View>
  );
};

export default DebugScreen;