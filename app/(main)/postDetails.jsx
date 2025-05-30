import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../../assets/icons';
import CommentItem from '../../components/CommentItem';
import Input from '../../components/Input';
import Loading from '../../components/Loading';
import PostCard from '../../components/PostCard';
import { theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { hp, wp } from '../../helpers/common';
import { supabase } from '../../lib/supabase';
import { createNotification } from '../../services/notificationService';
import { createComment, fetchPostDetails, removeComment, removePost } from '../../services/postService';
import { getUserData } from '../../services/userService';

const PostDetails = () => {
    const {postId, commentId} = useLocalSearchParams();
    const {user} = useAuth();
    const router = useRouter();

    const [startLoading, setStartLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [post, setPost] = useState(null);

    const inputRef = useRef(null);
    const commentRef = useRef('');




    const handleNewComment = async (payload) => {

    if (payload.new && String(payload.new.postId) === String(postId)) {
        let newComment = { ...payload.new };
        let res = await getUserData(newComment.userId);
        newComment.user = res.success ? res.data : {};

        setPost((prev) => ({
            ...prev,
            comments: [newComment, ...prev.comments],
        }));

        
        }
      };



      useEffect(() => {
          // ✅ Supabase v1: use .from().on()
          const subscription = supabase
              .from('comments')
              .on('INSERT', handleNewComment)
              .subscribe();

          getPostDetails();

          return () => {
              // ✅ Cleanup for Supabase v1
              supabase.removeSubscription(subscription);
          };
      }, []);


    const getPostDetails = async () => {
      // fetch post details here
      let res = await fetchPostDetails(postId);
      if(res.success) setPost(res.data);
      setStartLoading(false);

    }

    const onNewComment = async () => {
        if(!commentRef.current) return null;
        let data = {
          userId: user?.id,
          postId: post?.id,
          text: commentRef.current
        }
        // create comment
        setLoading(true);
        let res = await createComment(data);
        setLoading(false);
        if(res.success){
          if(user.id !== post.userId){
            //send notification
            let notify = {
              senderId: user.id,
              receiverId: post.userId,
              title: 'commented on your post',
              data: JSON.stringify({postId: post.id, commentId: res?.data?.id})
            }
            createNotification(notify);
          }
          inputRef?.current?.clear();
          commentRef.current = "";
        } else{
          Alert.alert('Comment', res.msg)
        }

    }

    const onDeleteComment = async (comment) => {
      console.log('deleting comment: ', comment)
      let res = await removeComment(comment?.id);
      if(res.success){
        setPost(prevPost => {
          let updatedPost = {...prevPost};
          updatedPost.comments = updatedPost.comments.filter(c => c.id !== comment.id);
          return updatedPost;
        }
      )
      }else{
        Alert.alert('Comment', res.msg)
      }
    }

    const onDeletePost = async (item) => {
      //delete post
      let res = await removePost(post.id);
      if(res.success){
        router.back();
      }else{
        Alert.alert('Post', res.msg);
      }
    }

    const onEditPost = async (item) => {
      router.back();
      router.push({pathname: 'newPost', params: {...item}});
    }

    if(startLoading){
      return (
        <View style={styles.center}>
          <Loading/>
        </View>
      )
    }

    if(!post){
      return (
        <View style={[styles.center, {justifyContent: 'flex-start', marginTop: 100}]}>
          <Text style={styles.notFound}> Post not found !</Text>
        </View>
      )
    }
  return (

      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          <PostCard item={{...post, comments: [{count: post?.comments?.length}]}} 
          currentUser={user}
          router={router} 
          hasShadow={false} 
          showMoreIcon={false}
          showDelete={true}
          onDelete={onDeletePost}
          onEdit={onEditPost}

          />

          {/* comment input  */}
          <View style={styles.inputContainer}>
            <Input
            inputRef={inputRef}
            placeholder='Write comment...' 
            onChangeText = { value => commentRef.current = value}
            placeholderTextColor={theme.colors.textLight} 
            containerStyle={{flex: 1, height: hp(6.2), borderRadius: theme.radius.xl}}/>
            {
              loading ? (
                  <View style={styles.loading}>
                    <Loading size="small"/>
                    </View>
              ) : (
                <TouchableOpacity style={styles.sendIcon} onPress={onNewComment}>
                  <Icon name="send" color={theme.colors.primaryDark}/>
                </TouchableOpacity>

              )
            }
          </View>

          {/* comment list  */}
          <View style={{marginVertical: 15, gap: 17}}>
            {post?.comments?.map(comment =>{
              return <CommentItem 
              key={comment?.id?.toString()} 
              item={comment} 
              onDelete={onDeleteComment}
              highlight={comment.id == commentId}
              canDelete={user.id === comment.userId || user.id === post.userId}/>
            })}

            {
            post?.comments?.length ===0 && (
              <Text style={{color: theme.colors.text, marginLeft: 5}}>
                Be the first to comment! 
              </Text>
            )
            }
          </View>
        </ScrollView>
      </View>
  )
}

export default PostDetails;

const styles = StyleSheet.create({
    center: {
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    container: {
        backgroundColor: 'white',
        flex: 1,
        paddingVertical: wp(7),
    },
    inputContainer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
    },
    list: {
        paddingHorizontal: wp(4),
    },
    loading: {
        alignItems: 'center',
        height: hp(5.8),
        justifyContent: 'center',
        transform: [{ scale: 1.3 }],
        width: hp(5.8),
    },
    notFound: {
        color: theme.colors.text,
        fontSize: hp(2.5),
        fontWeight: theme.fonts.medium,
    },
    sendIcon: {
        alignItems: 'center',
        borderColor: theme.colors.primary,
        borderCurve: 'continuous',
        borderRadius: theme.radius.lg,
        borderWidth: 0.8,
        height: hp(5.8),
        justifyContent: 'center',
        width: hp(5.8),
    },
});
