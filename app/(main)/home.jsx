import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import Icon from '../../assets/icons';
import Avatar from '../../components/Avatar';
import Loading from '../../components/Loading';
import PostCard from '../../components/PostCard';
import ScreenWrapper from '../../components/ScreenWrapper';
import { theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { hp, wp } from '../../helpers/common';
import { supabase } from '../../lib/supabase';
import { fetchPosts } from '../../services/postService';
import { getUserData } from '../../services/userService';

let limit = 0;
const Home = () => {
  const {user} = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState([]);

  const [hasMore, setHasMore] = useState(true);

  const handlePostEvent = async (payload) => {
    if(payload.eventType === 'INSERT' && payload?.new?.id){
      let newPost = {...payload.new};
      let res = await getUserData(newPost.userId);
      newPost.postLikes = [];
      newPost.comments = [{count: 0}];
      newPost.user = res.success? res.data: {};
      setPosts(prevPost=> [newPost, ...prevPost])

    }

    if(payload.eventType=== 'DELETE' && payload.old.id){
      setPosts(prevPosts => {
        let updatedPosts = prevPosts.filter(post => post.id !== payload.old.id);
        return updatedPosts;
      })
    }

    if(payload.eventType === 'UPDATE' && payload?.new?.id){
      setPosts(prevPosts => {
        let updatedPosts = prevPosts.map(post => {
          if(post.id === payload.new.id){
            post.body = payload.new.body;
            post.file = payload.new.file
          }
          return post;
        });
        return updatedPosts;
      })
    }
  }

  useEffect(() => {

    // let postChannel = supabase
    // .channel('posts')
    // .on('postgres_changes', {event: '*', schema: 'public', table: 'posts'}, handlePostEvent)
    // .subscribe();

    let subscription = supabase
    .from('posts')
    .on('*', handlePostEvent)
    .subscribe();


    // getPosts();

    return () => {
      // supabase.removeChannel(postChannel);
      supabase.removeSubscription(subscription);
      
    }
  }, []);

  // const handleAddComment = async (payload) => {
  //   console.log('payload: ', payload)
  // }

  // useEffect(() => {
  //   let commentAddSubscription = supabase
  //   .from('comments')
  //   .on('INSERT', handleAddComment)
  //   .subscribe();


  //   return () => {
  //     supabase.removeSubscription(commentAddSubscription);
  //   }
  // }, [])



// Experiment 
// In your Home component
// useEffect(() => {
//   // Initial fetch
//   getPosts();

//   // Set up subscriptions
//   const subscriptions = [
//     supabase
//       .from('likes')
//       .on('*', handleLikeChange)
//       .subscribe(),
//     supabase
//       .from('comments')
//       .on('*', handleCommentChange)
//       .subscribe(),
//     supabase
//       .from('posts')
//       .on('INSERT', handleNewPost)
//       .subscribe()
//   ];

//   return () => {
//     subscriptions.forEach(sub => supabase.removeSubscription(sub));
//   };
// }, []);

// const handleLikeChange = async (payload) => {
//   const postId = payload.new?.post_id || payload.old?.post_id;
//   if (!postId) return;

//   if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
//     await updateLikeCount(postId);
//   }
// };

// const handleCommentChange = async (payload) => {
//   const postId = payload.new?.post_id || payload.old?.post_id;
//   if (!postId) return;

//   if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
//     await updateCommentCount(postId);
//   }
// };

// // Update like count for a specific post
// const updateLikeCount = async (postId) => {
//   // Get updated like count
//   const { count, error } = await supabase
//     .from('likes')
//     .select('*', { count: 'exact', head: true })
//     .eq('post_id', postId);

//   if (!error) {
//     setPosts(prevPosts =>
//       prevPosts.map(post =>
//         post.id === postId
//           ? {
//               ...post,
//               likes_count: count,
//               // Update is_liked status if needed
//               // is_liked: payload?.eventType === 'INSERT' 
//               //   ? true  // or your specific logic
//               //   : payload?.eventType === 'DELETE'
//               //   ? false
//               //   : post.is_liked
//             }
//           : post
//       )
//     );
//   }
// };

// // Update comment count for a specific post
// const updateCommentCount = async (postId) => {
//   // Get updated comment count
//   const { count, error } = await supabase
//     .from('comments')
//     .select('*', { count: 'exact', head: true })
//     .eq('post_id', postId);

//   if (!error) {
//     setPosts(prevPosts =>
//       prevPosts.map(post =>
//         post.id === postId
//           ? { ...post, comments_count: count }
//           : post
//       )
//     );
//   }
// };

// const handleNewPost = async (payload) => {
//   if (payload.eventType === 'INSERT' && payload.new?.id) {
//     const newPost = { ...payload.new };
//     const res = await getUserData(newPost.user_id);
//     if (res.success) {
//       newPost.user = res.data;
//       setPosts(prevPosts => [newPost, ...prevPosts]);
//     }
//   }
// };
// end


  const getPosts = async () => {
    // call the api here
    if(!hasMore) return null;
    limit = limit + 4;
    console.log('fetching post: ', limit);
    let res = await fetchPosts(limit);
    if(res.success){
      if(posts.length === res.data.length) setHasMore(false);
      setPosts(res.data);
    }
  }

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

        {/* posts  */}
        <FlatList data={posts} showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listStyle}
        keyExtractor={item => item.id.toString()}
        renderItem={({item}) => 
          <PostCard item={item} 
          currentUser={user}
          router={router}
          />
        }
        onEndReached={() => {
          getPosts();
          console.log('got to the end')
        }}
        onEndReachedThreshold={0}
        ListFooterComponent={( hasMore? (
          <View style={{marginVertical: posts.length=== 0 ? 200: 30}}>
            <Loading/>
          </View>):(
            <View style={{marginVertical: 30}}>
              <Text style={styles.noPosts}> No more posts </Text>
              </View>
          )
        )}
        />
      </View>
    </ScreenWrapper>
  )
}

export default Home;

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
        marginHorizontal: wp(0),
    },
    header: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        marginHorizontal: wp(7),
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
        paddingHorizontal: wp(1.5),
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