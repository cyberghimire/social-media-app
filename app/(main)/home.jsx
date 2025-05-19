import { Alert, Button, StyleSheet, Text } from 'react-native'
import ScreenWrapper from '../../components/ScreenWrapper'
// import { useAuth } from '../../contexts/AuthContext'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'

const Home = () => {
  const router = useRouter();
  // const {setAuth} = useAuth();
  const onLogout = async () => {
    // setAuth(null);
    const {error} = await supabase.auth.signOut();
    if(error){
      Alert.alert('Sign out', 'Error signing out');
    }
  }
  // const onDebug = () => {
  //   router.push('/debug');
  // }
  return (
    <ScreenWrapper>
      <Text>Home</Text>
      <Button title="logout" onPress={onLogout}/>
      {/* <Button title="debug" onPress={onDebug}/> */}
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({})