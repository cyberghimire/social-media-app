import { Image } from 'expo-image'
import * as MediaLibrary from 'expo-media-library'
import { useVideoPlayer, VideoView } from 'expo-video'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { Alert, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import RenderHTML from 'react-native-render-html'
import Icon from '../assets/icons'
import { theme } from '../constants/theme'
import { hp, stripHtmlTags, wp } from '../helpers/common'
import { downloadFile, getSupabaseFileUrl } from '../services/imageService'
import { createPostLike, removePostLike } from '../services/postService'
import Avatar from './Avatar'

import * as Sharing from 'expo-sharing'
import Loading from './Loading'

const textStyle = {
        color: theme.colors.dark,
        fontSize: hp(1.75)
    }
const tagsStyles ={
    div: textStyle,
    p: textStyle,
    ol: textStyle,
    h1: {
        color: theme.colors.dark
    },
    h4: {
        color: theme.colors.dark
    }
}

const PostCard = ({
    item,
    currentUser,
    router,
    hasShadow=true,
    showMoreIcon=true,
    showDelete = false,
    onDelete = () => {},
    onEdit = () => {}
}) => {
    const shadowStyles = {
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.06,
        shadowRadius: 6,
        elevation: 1
    }

    const [likes, setLikes] = useState([]);

    const [loading, setLoading] = useState(false);


    useEffect(() => {
        setLikes(item?.postLikes)
    }, [])

    const openPostDetails = () => {
        //later
        if(!showMoreIcon) return null;
        router.push({pathname: 'postDetails', params: {postId: item?.id}})
    }


    const onLike = async () => {
        if(liked){
            //remove like
            let updatedLikes = likes.filter(like => like.userId !== currentUser?.id)
            setLikes([...updatedLikes])

            let res = await removePostLike(item?.id, currentUser?.id);
            console.log('removed like: ', res);
            if(!res.success){
                Alert.alert('Post', 'Something went wrong!');
            }
        } else{
            //create like
            let data = {
            userId: currentUser?.id,
            postId: item?.id
            }
            setLikes([...likes, data])

            let res = await createPostLike(data);
            console.log('added like: ', res);
            if(!res.success){
                Alert.alert('Post', 'Something went wrong!');
            }
        }
        
    }

    const videoUri = getSupabaseFileUrl(item?.file)

    const videoPlayer = useVideoPlayer(videoUri, (player) => {
      if (player && videoUri) {
        // player.loop = true;
        // player.play();
      }
    });

    const onShare = async () => {
        let content = { message: stripHtmlTags(item?.body) };

        if (!item?.file){
            await Share.share(content);
        }

        if (item?.file) {
            //download the file then share the local URI
            setLoading(true);
            const fileUrl = getSupabaseFileUrl(item?.file).uri;
            const localUri = await downloadFile(fileUrl);  // ✅ Await here

            setLoading(false);
            if (localUri) {
            content.url = localUri;
            } else {
            Alert.alert("Share", "Failed to download the file.");
            return;
            }
            if (!(await Sharing.isAvailableAsync())) {
                Alert.alert("Sharing not available");
                return;
            }

            try {
                await Sharing.shareAsync(content.url);
            } catch (error) {
                console.error("Sharing error:", error);
            }
        }

    };


    const ensureMediaLibraryPermission = async () => {
        const { status } = await MediaLibrary.getPermissionsAsync(); // check current status

        if (status === 'granted') {
            return true;
        }

        const { status: newStatus } = await MediaLibrary.requestPermissionsAsync(); // only ask if needed
        return newStatus === 'granted';
    };

    const onSaveImage = async () => {
        const fileUrl = getSupabaseFileUrl(item?.file).uri;
        const fileUri = await downloadFile(fileUrl);
        const hasPermission = await ensureMediaLibraryPermission();
        if (!hasPermission) {
                Alert.alert("Permission denied", "Cannot save image without permission.");
                return;
        }
        try {
            const asset = await MediaLibrary.createAssetAsync(fileUri);
            await MediaLibrary.createAlbumAsync("LinkUp Downloads", asset, false);
            Alert.alert("Success", "Image saved to your gallery.");
        } catch (err) {
            console.error("Error saving image:", err);
            Alert.alert("Error", "Could not save image.");
        }
    };


    const handlePostDelete = () => {
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
    

    const liked = likes.filter(like => like.userId === currentUser?.id)[0]? true: false;

    const createdAt = moment(item?.created_at).format('MMM D Y');


  return (
    <View style={[styles.container, hasShadow && shadowStyles]}>
        <View style={styles.header}>
            {/* user info and post time  */}
            <View style={styles.userInfo}>
                <Avatar 
                    size={hp(4.5)}
                    uri={item?.user?.image}
                    rounded={theme.radius.md}
                    />
                    <View style={{gap: 2}}>
                        <Text style={styles.username}>{item?.user?.name}</Text>
                        <Text style={styles.postTime}>{createdAt}</Text>
                    </View>
            </View>

            {
                showMoreIcon && (

                    <TouchableOpacity onPress={openPostDetails}>
                        <Icon name='threeDotsHorizontal' size={hp(3.4)} strokeWidth={3} color={theme.colors.text}/>
                    </TouchableOpacity>
                )
            }

            {showDelete && currentUser.id === item?.user.id && (
                <View style={styles.actions}>
                    <TouchableOpacity onPress={() => onEdit(item)}>
                        <Icon name='edit' size={hp(2.5)} color={theme.colors.text}/>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handlePostDelete}>
                        <Icon name='delete' size={hp(2.5)} color={theme.colors.rose}/>
                    </TouchableOpacity>
                </View>
            )}
            
        </View>
        {/* post body and media  */}
        <View style={styles.content}>
            <View style={styles.postBody}>
                {
                    item?.body && (
                        <RenderHTML
                        contentWidth={wp(100)}
                        source={{html: item?.body}}
                        tagsStyles={tagsStyles}
                        />
                    )
                }
            </View>

            {/* post image */}

            {
                item?.file && item?.file?.includes('postImages') && (
                    <Image 
                    source={getSupabaseFileUrl(item?.file)}
                    transition={100}
                    style= {styles.postMedia}
                    contentFit='cover'
                    />
                )
            }

            {/* post video  */}

            {
                
                item?.file && item?.file?.includes('postVideos') && (
                    <VideoView
                        style={[styles.postMedia, {height: hp(30)}]}
                        player={videoPlayer}
                        resizeMode="cover"
                      />
                )
                
            }
        </View>

        {/* like, comment & share */}
        <View style={styles.footer}>
            <View style={styles.footerButton}>
                <TouchableOpacity onPress={onLike}>
                    <Icon name="heart" size={24} fill={liked? theme.colors.rose: 'transparent'} color={liked? theme.colors.rose: theme.colors.textLight}/>

                </TouchableOpacity>
                <Text style={styles.count}>
                    {
                        likes?.length
                    }
                </Text>
            </View>
            <View style={styles.footerButton}>
                <TouchableOpacity onPress={openPostDetails}>
                    <Icon name="comment" size={24} color={theme.colors.textLight}/>

                </TouchableOpacity>
                <Text style={styles.count}>
                    {
                        item?.comments[0].count
                    }
                </Text>
            </View>
            <View style={styles.footerButton}>
                {
                    loading? (
                        <Loading size="small"/>
                    ): (
                <TouchableOpacity onPress={onShare}>
                    <Icon name="share" size={24} color={theme.colors.textLight}/>

                </TouchableOpacity>
                    )
                }
            </View>
            { item?.file && 
            
                <View style={styles.footerButton}>
                    <TouchableOpacity onPress={onSaveImage}>
                        <Icon name="download" size={24} color={theme.colors.textLight}/>

                    </TouchableOpacity>
                </View>
            }
        </View>
    </View>
  )
}

export default PostCard

const styles = StyleSheet.create({
    actions: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 18,
    },
    container: {
        backgroundColor: 'white',
        borderColor: theme.colors.gray,
        borderCurve: 'continuous',
        borderRadius: theme.radius.xxl * 1.1,
        borderWidth: 0.5,
        gap: 10,
        marginBottom: 15,
        padding: 5,
        paddingVertical: 12,
        shadowColor: '#000000',
    },
    content: {
        gap: 10,
    },
    count: {
        color: theme.colors.text,
        fontSize: hp(1.8),
    },
    footer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 15,
    },
    footerButton: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 4,
        marginLeft: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    postBody: {
        marginLeft: 5,
    },
    postMedia: {
        borderCurve: 'continuous',
        borderRadius: theme.radius.xl,
        height: hp(40),
        width: '100%',
    },
    postTime: {
        color: theme.colors.textLight,
        fontSize: hp(1.4),
        fontWeight: theme.fonts.medium,
    },
    userInfo: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    username: {
        color: theme.colors.textDark,
        fontSize: hp(1.4),
        fontWeight: theme.fonts.medium,
    },
});