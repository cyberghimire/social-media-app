import { useRouter } from 'expo-router'
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import Button from '../../components/Button'

import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { useEffect, useState } from 'react'
import Icon from '../../assets/icons'
import BackButton from '../../components/BackButton'
import Input from '../../components/Input'
import ScreenWrapper from '../../components/ScreenWrapper'
import { theme } from '../../constants/theme'
import { useAuth } from '../../contexts/AuthContext'
import { hp, wp } from '../../helpers/common'
import { getUserImageSrc, uploadFile } from '../../services/imageService'
import { updateUser } from '../../services/userService'


const EditProfile = () => {
    const router = useRouter();
    const {user: currentUser, setUserData} = useAuth();

    const [loading, setLoading] = useState(false);
    
    const [user, setUser] = useState({
        name: '',
        phoneNumber: '',
        image: null,
        bio: '',
        address: ''
    })
    
    useEffect(() => {
        if(currentUser){
            setUser({
                name: currentUser.name || '',
                phoneNumber: currentUser.phoneNumber || '',
                image: currentUser.image || null,
                address: currentUser.address || '',
                bio: currentUser.bio || '',
            })
        }
    }, [currentUser])

    const onSubmit = async () => {
        let userData = {...user};
        let {name, phoneNumber, address, image, bio} = userData;
        if(!name || !phoneNumber || !address || !bio){
            Alert.alert('Profile Edit', "Please fill all the fields")
            return;
        }
        setLoading(true);

        if(typeof image === 'object'){
            // upload image
            let imageRes = await uploadFile('profiles', image?.uri, true);
            if(imageRes.success) userData.image = imageRes.data;
            else userData.image = null;
        }
        //update user
        const res = await updateUser(currentUser?.id, userData);
        setLoading(false);

        if(res.success){
            setUserData({...currentUser, ...userData})
            router.back();
        }
    }
    
    let imageSource = user.image && typeof user.image == 'object'? user.image.uri : getUserImageSrc(user.image);

    const onPickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [1, 1],
                    quality: 0.7,
    });

    if(!result.canceled){
        setUser({...user, image: result.assets[0]})
    }
    }
  return (
    <ScreenWrapper bg={"white"}>
      <View style={styles.container}>
        <ScrollView style={{flex: 1}}>
            <View style={styles.container}>
                <BackButton router={router}/>
                <Text style={styles.title}> Edit Profile</Text>
            </View>
            <View style={styles.form}>
                <View style={styles.avatarContainer}>
                    <Image source={imageSource} style={styles.avatar}/>
                    <Pressable style={styles.cameraIcon} onPress={onPickImage}>
                        <Icon name="camera" size={20} strokeWidth={2.5}/>
                    </Pressable>
                </View>
                <Text style={{fontSize: hp(1.5), color: theme.colors.text}}>
                    Please fill our your profile details
                </Text>
                {/* name */}
                <Input 
                icon={<Icon name="user"/>} 
                placeholder="Enter your name" 
                value={user.name} 
                onChangeText={value => setUser({...user, name: value})}/>
                <Input 
                icon={<Icon name="call"/>} 
                placeholder="Enter your phone number" 
                value={user.phoneNumber} 
                onChangeText={value => setUser({...user, phoneNumber: value})}/>
                <Input 
                icon={<Icon name="location"/>} 
                placeholder="Enter your address" 
                value={user.address} 
                onChangeText={value => setUser({...user, address: value})}/>
                <Input 
                placeholder="Enter your bio" 
                value={user.bio} 
                multiline={true}
                containerStyle={styles.bio}
                onChangeText={value => setUser({...user, bio: value})}/>

                <Button title="Update" loading={loading} onPress={onSubmit}/>
            </View>
        </ScrollView>
      </View>
    </ScreenWrapper>
  )
}

export default EditProfile

const styles = StyleSheet.create({
    avatar: {
        borderColor: theme.colors.darkLight,
        borderCurve: 'continuous',
        borderRadius: theme.radius.xxl * 1.8,
        borderWidth: 1,
        height: '100%',
        width: '100%',
    },
    avatarContainer: {
        alignSelf: 'center',
        height: hp(14),
        width: hp(14),
    },
    bio: {
        alignItems: 'flex-start',
        flexDirection: 'row',
        height: hp(15),
        paddingVertical: 15,
    },
    cameraIcon: {
        backgroundColor: 'white',
        borderRadius: 50,
        bottom: 0,
        elevation: 7,
        padding: 8,
        position: 'absolute',
        right: -10,
        shadowOffset: { height: 4, width: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
    },
    container: {
        flex: 1,
        paddingHorizontal: wp(4),
        flexDirection: 'row'
    },
    form: {
        gap: 18,
        marginTop: 20,
    },
    input: {
        flexDirection: 'row',
        borderColor: theme.colors.text,
        borderCurve: 'continuous',
        borderRadius: theme.radius.xxl,
        borderWidth: 0.4,
        gap: 15,
        padding: 17,
        paddingHorizontal: 20,
    },
    // title: {
    //     position: 'absolute',
    //     left: 0,
    //     right: 0,
    //     top: 3,
    //     textAlign: 'center',
    //     fontSize: hp(2.7),
    //     fontWeight: theme.fonts.semibold,
    //     color: theme.colors.textDark
    // },
     title: {
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: hp(2.7),
        fontWeight: theme.fonts.semibold,
        color: theme.colors.textDark,
        flex: 1,
    },
    
});