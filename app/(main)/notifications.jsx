import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenWrapper from '../../components/ScreenWrapper';
import { theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { hp, wp } from '../../helpers/common';
import { fetchNotifications } from '../../services/notificationService';


import { useRouter } from 'expo-router';
import BackButton from '../../components/BackButton';
import NotificationItem from '../../components/NotificationItem';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const {user} = useAuth();
  const router = useRouter();

  useEffect(()  => {
    getNotifications();
  }, []);

  const getNotifications = async () => {
    let res = await fetchNotifications(user.id);
    if(res.success) setNotifications(res.data);
  }
  return (
    <ScreenWrapper>
      <View style={styles.container}>
            <BackButton router={router}/>
            <Text style={styles.title}> Notifications</Text>
      </View>
      <View style = {styles.container}>
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listStyle}>
          {
            notifications.map(item => {
              return (
                <NotificationItem
                  item={item}
                  key={item?.id}
                  router={router}
                  />
              )
            })
          }
          {
            notifications.length===0 && (
              <Text style={styles.noData}> No notifications yet</Text>
            )
          }
        </ScrollView>
      </View>
    </ScreenWrapper>
  )
}

export default Notifications;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wp(4),
        flexDirection: 'row'
    },
    listStyle: {
        gap: 10,
        paddingVertical: 20,
    },
    noData: {
        color: theme.colors.text,
        fontSize: hp(1.8),
        fontWeight: theme.fonts.medium,
        textAlign: 'center',
    },
    title: {
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: hp(2.7),
        fontWeight: theme.fonts.semibold,
        color: theme.colors.textDark,
        flex: 1,
    }
});