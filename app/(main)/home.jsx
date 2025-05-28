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

  const handlePostEvent = async (payload) => {
    if(payload.eventType === 'INSERT' && payload?.new?.id){
      let newPost = {...payload.new};
      let res = await getUserData(newPost.userId);
      newPost.user = res.success? res.data: {};
      setPosts(prevPost=> [newPost, ...prevPost])

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


    getPosts();

    return () => {
      // supabase.removeChannel(postChannel);
      supabase.removeSubscription(subscription);
    }
  }, []);

  const getPosts = async () => {
    // call the api here
    limit = limit + 10;
    console.log('fetching post: ', limit);
    let res = await fetchPosts(limit);
    if(res.success){
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
        ListFooterComponent={(
          <View style={{marginVertical: posts.length=== 0 ? 200: 30}}>
            <Loading/>
          </View>
        )}
        />
      </View>
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