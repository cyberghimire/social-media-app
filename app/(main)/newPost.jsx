import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../../assets/icons';
import Avatar from '../../components/Avatar';
import BackButton from '../../components/BackButton';
import Button from '../../components/Button';
import RichTextEditor from '../../components/RichTextEditor';
import ScreenWrapper from '../../components/ScreenWrapper';
import { theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { hp, wp } from '../../helpers/common';
import { getSupabaseFileUrl } from '../../services/imageService';
import { createOrUpdatePost } from '../../services/postService';


const NewPost = () => {
  const router = useRouter();
  const user = useAuth();
  const bodyRef = useRef("");
  const editorRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(file);

  const onPick = async (isImage) => {
    let mediaConfig = {
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: true,
                        aspect: [1, 1],
                        quality: 0.7,
        }
        if(!isImage){
          mediaConfig = {
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true
          }
        }

        let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);
        if(!result.canceled) {
          setFile(result.assets[0])
        }
  }

  const isLocalFile = file => {
    if(!file) return null;
    if(typeof file === 'object') return true;
    return false;
  }

  const getFileType = file => {
    if(!file) return null;
    if(isLocalFile(file)){
      return file.type;
    }
    // check image or video for remote file
    if(file.includes('postImages')){
      return 'image';
    }
    return 'video';
  }

  const getFileUri = file => {
    if(!file) return null;
    if(isLocalFile(file)){
      return file.uri;
    }
    return getSupabaseFileUrl(file)?.uri;
  }

  const onSubmit = async () => {
    if(!bodyRef.current && !file){
      Alert.alert("Post", "Please choose an image or add post status");
      return;
    }
    let data = {
      file, 
      body: bodyRef.current,
      userId: user?.user.id,

    }

    //create post
    setLoading(true);
    let res = await createOrUpdatePost(data);
    setLoading(false);
    if(res.success){
      setFile(null);
      bodyRef.current = '';
      editorRef.current?.setContentHTML('');
      router.back();
    } else{
      Alert.alert('Post', res.msg)
    }


  }
  return (
    <ScreenWrapper bg="white">

      <View style={styles.headingContainer}>
                <BackButton router={router}/>
                <Text style={styles.mainTitle}> Create Post</Text>
            </View>
      <View style={styles.container}>
            <ScrollView contentContainerStyle={{gap: 20}}>
              {/* avatar  */}
              <View style={[styles.header, {top: hp(2)}]}>
                <Avatar uri={user?.user.image} size={hp(6.5)} rounded={theme.radius.xl}/>
                <View style={{gap: 2}}>
                  <Text style={styles.username}>
                    {user && user?.user.name}
                  </Text>
                  <Text style={styles.publicText}>
                    Public
                  </Text>
                </View>
              </View>
              <View style={[styles.textEditor, {top: hp(1.5)} ]}>
                <RichTextEditor editorRef={editorRef} onChange={body => bodyRef.current = body}/>
              </View>
              {
                file && (
                  <View style= {styles.file}>
                    {
                      getFileType(file) === 'video' ? (
                        <Video 
                        style={{flex: 1}}
                        source={{
                          uri: getFileUri(file)
                        }}
                        useNativeControls
                        resizeMode='cover'
                        isLooping
                        />
                      ): (
                        <Image source={{uri: getFileUri(file)}} resizeMode='cover' style={{flex: 1}}/>
                      )
                    }
                    <Pressable style={styles.closeIcon} onPress={() => setFile(null)}>
                      <Icon name="delete" size={20} color="white"/>
                    </Pressable>
                  </View>
                )
              }
              <View style={styles.media}>
                <Text style={styles.addImageText}> Add to your post</Text>
                <View style={styles.mediaIcons}>
                  <TouchableOpacity onPress={() => onPick(true)}>
                    <Icon name="image" size={30} color={theme.colors.dark}/>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => onPick(false)}>
                    <Icon name="video" size={33} color={theme.colors.dark}/>
                  </TouchableOpacity>
                </View>
              </View>
              </ScrollView>
            <Button buttonStyle={{height: hp(6.2), bottom: hp(4), marginBottom: 10}}
            title="Post"
            loading={loading}
            hasShadow={false}
            onPress={onSubmit}
            />
      </View>
    </ScreenWrapper>
  )
}

export default NewPost;

const styles = StyleSheet.create({
    addImageText: {
        color: theme.colors.text,
        fontSize: hp(1.9),
        fontWeight: theme.fonts.semibold,
    },
    avatar: {
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderCurve: 'continuous',
        borderRadius: theme.radius.xl,
        borderWidth: 1,
        height: hp(6.5),
        width: hp(6.5),
    },
    closeIcon: {
        backgroundColor: 'rgba(255, 0, 0, 0.6)',
        borderRadius: 50,
        padding: 7,
        position: 'absolute',
        right: 10,
        top: 10,
    },
    container: {
        flex: 1,
        gap: 15,
        marginBottom: 30,
        paddingHorizontal: wp(4),
    },
    headingContainer: {
        flex: 1,
        paddingHorizontal: wp(4),
        flexDirection: 'row'
    },
    file: {
        borderCurve: 'continuous',
        borderRadius: theme.radius.xl,
        height: hp(25),
        overflow: 'hidden',
        width: '100%',
    },
    header: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 12,
    },
    imageIcon: {
        borderRadius: theme.radius.md,
    },
    media: {
        alignItems: 'center',
        borderColor: theme.colors.gray,
        borderCurve: 'continuous',
        borderRadius: theme.radius.xl,
        borderWidth: 1.5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        paddingHorizontal: 18,
    },
    mediaIcons: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 15,
    },
    publicText: {
        color: theme.colors.textLight,
        fontSize: hp(1.7),
        fontWeight: theme.fonts.medium,
    },
    textEditor: {},
    title: {
        color: theme.colors.text,
        fontSize: hp(2.5),
        fontWeight: theme.fonts.semibold,
        textAlign: 'center',
    },
    mainTitle: {
        alignItems: 'center',
        textAlign: 'center',
        justifyContent: 'center',
        fontSize: hp(2.7),
        fontWeight: theme.fonts.semibold,
        color: theme.colors.textDark,
        flex: 1,
    },
    username: {
        color: theme.colors.text,
        fontSize: hp(2.2),
        fontWeight: theme.fonts.semibold,
    },
    video: {},
});