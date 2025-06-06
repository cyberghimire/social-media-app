import moment from 'moment';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../assets/icons';
import { theme } from '../constants/theme';
import { hp } from '../helpers/common';
import Avatar from './Avatar';

const CommentItem = ({
    item,
    canDelete=false,
    onDelete = ()=>{},
    highlight=false
}) => {

    const createdAt = moment(item?.created_at).format('MMM d');

    const handleDelete = () => {
        Alert.alert("Confirm", "Are you sure you want delete?", [
            {
                text: 'Cancel',
                onPress: () => {},
                style: 'cancel'
            },
            {
                text: 'Delete',
                onPress: () => onDelete(item),
                style: 'destructive'
            }
        ])
    }
  return (
    <View style={styles.container}>
      <Avatar
      uri={item?.user?.image}/>
      <View style={[styles.content, highlight && styles.highlight]}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems:'center'}}>
            <View style={styles.nameContainer}>
                <Text style={styles.text}>
                    {item?.user?.name}
                </Text>
                <Text> {'•'} </Text>
                <Text style={[styles.text, {color: theme.colors.textLight}]}>
                    {createdAt}
                </Text>
            </View>
            {
                canDelete && (

                    <TouchableOpacity onPress={handleDelete}>
                        <Icon name="delete" size={20} color={theme.colors.rose}/>
                    </TouchableOpacity>
                )
            }
        </View>
        <Text style={[styles.text, {fontWeight: 'normal'}]}>
            {item?.text}
        </Text>
      </View>
    </View>
  )
}

export default CommentItem

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        gap: 7,
    },
    content: {
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
        borderCurve: 'continuous',
        borderRadius: theme.radius.md,
        flex: 1,
        gap: 5,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    highlight: {
        backgroundColor: 'white',
        borderColor: theme.colors.dark,
        borderWidth: 0.2,
        elevation: 5,
        shadowColor: theme.colors.dark,
        shadowOffset: { height: 0, width: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    nameContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 3,
    },
    text: {
        color: theme.colors.textDark,
        fontSize: hp(1.6),
        fontWeight: theme.fonts.medium,
    },
});
