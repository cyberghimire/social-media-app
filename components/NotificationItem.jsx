import moment from 'moment';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../constants/theme';
import { hp } from '../helpers/common';
import Avatar from './Avatar';

const NotificationItem = ({item, router}) => {
    const handleClick = () => {
        let {postId, commentId} = JSON.parse(item?.data);
        router.push({pathname: 'postDetails', params: {postId, commentId}})
        //open post details
    }

    const createdAt = moment(item?.item?.created_at).format('MMM d')
  return (
    <TouchableOpacity style={styles.container} onPress={handleClick}>
      <Avatar uri={item?.item?.sender?.image} size={hp(5)}/>
      <View style={styles.nameTitle}>
        <Text style={styles.text}>
            {item?.sender?.name}
        </Text>
        <Text style={[styles.text, {color: theme.colors.textDark}]}>
            {item?.title}
        </Text>
      </View>
      <Text style={[styles.text, {color: theme.colors.textLight}]}>
        {createdAt}
      </Text>
    </TouchableOpacity>
  )
}

export default NotificationItem

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        backgroundColor: 'white',
        borderColor: theme.colors.darkLight,
        borderCurve: 'continuous',
        borderRadius: theme.radius.xxl,
        borderWidth: 0.5,
        flex: 1,
        flexDirection: 'row',
        gap: 12,
        justifyContent: 'space-between',
        padding: 15,
    },
    nameTitle: {
        flex: 1,
        gap: 2,
    },
    text: {
        color: theme.colors.text,
        fontSize: hp(1.6),
        fontWeight: theme.fonts.medium,
    },
});