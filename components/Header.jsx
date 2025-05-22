import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';
import { hp } from '../helpers/common';
import BackButton from './BackButton';

const Header = ({title, showBackButton=true, mb=10}) => {
    const router = useRouter();
  return (
    <View style={[styles.container, {marginBottom: mb}]}>
        {
            showBackButton && (
                <View style={styles.backButton}>
                    <BackButton router={router}  />
                </View>

            )
        }
        <Text style={styles.title}>{title || ""}</Text>
    </View>
  )
}

export default Header;

const styles = StyleSheet.create({
    container:{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 5,
        gap: 10,
    },
    title: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 3,
        textAlign: 'center',
        fontSize: hp(2.7),
        fontWeight: theme.fonts.semibold,
        color: theme.colors.textDark
    },
    // container: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     paddingVertical: 10,
    //     },

    // title: {
    //     alignItems: 'center',
    //     textAlign: 'center',
    //     justifyContent: 'center',
    //     fontSize: hp(2.7),
    //     fontWeight: theme.fonts.semibold,
    //     color: theme.colors.textDark,
    //     flex: 1,
    // },

    backButton: {
        position: 'absolute',
        left: 0,
        top: 3

    }
})