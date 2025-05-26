import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useRouter } from 'expo-router';
import Icon from '../../assets/icons';
import Avatar from '../../components/Avatar';
import ScreenWrapper from '../../components/ScreenWrapper';
import { theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { hp, wp } from '../../helpers/common';

const Home = () => {
  const {user} = useAuth();
  const router = useRouter();
  // console.log(user);
  // const onLogout = async () => {
  //   // setAuth(null);
  //   const {error} = await supabase.auth.signOut();
  //   if(error){
  //     Alert.alert('Sign out', 'Error signing out');
  //   }
  // }
  // const onDebug = () => {
  //   router.push('/debug');
  // }
  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        {/* header  */}
        <View style={styles.header}>
            <Text style={styles.title}> LinkUp</Text>
            <View style={styles.icons}>
              <Pressable onPress={() => router.push('notifications')}>
                <Icon name="heart" size={hp(3.2)} strokeWidth={2} color={theme.colors.text}/>
              </Pressable>
              <Pressable onPress={() => router.push('newPost')}>
                <Icon name="plus" size={hp(3.2)} strokeWidth={2} color={theme.colors.text}/>
              </Pressable>
              <Pressable onPress={() => router.push('profile')}>
                <Avatar uri={user?.image} size={hp(4.3)} rounded={theme.radius.sm} style={{borderWidth: 2}}/>
              </Pressable>
            </View>
        </View>
      </View>
      {/* <Button title="logout" onPress={onLogout}/> */}
      {/* <Button title="debug" onPress={onDebug}/> */}
    </ScreenWrapper>
  )
}

export default Home

const styles = StyleSheet.create({
    avatarImage: {
        borderColor: theme.colors.gray,
        borderCurve: 'continuous',
        borderRadius: theme.radius.sm,
        borderWidth: 3,
        height: hp(4.3),
        width: hp(4.3),
    },
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginHorizontal: wp(4),
    },
    icons: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 18,
        width: '69%',
        justifyContent: 'flex-end',
    },
    listStyle: {
        paddingTop: 20,
        paddingHorizontal: wp(4),
    },
    noPosts: {
        color: theme.colors.text,
        fontSize: hp(2),
        textAlign: 'center',
    },
    pill: {
        alignItems: 'center',
        backgroundColor: theme.colors.roseLight,
        borderRadius: 20,
        height: hp(2.2),
        justifyContent: 'center',
        position: 'absolute',
        right: -10,
        top: -4,
        width: hp(2.2),
    },
    pillText: {
        color: 'white',
        fontSize: hp(1.2),
        fontWeight: theme.fonts.bold,
    },
    title: {
        color: theme.colors.text,
        fontSize: hp(3.2),
        fontWeight: theme.fonts.bold,
    },
});