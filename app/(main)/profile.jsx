import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from '../../assets/icons';
import Avatar from '../../components/Avatar';
import Header from '../../components/Header';
import Loading from '../../components/Loading';
import PostCard from '../../components/PostCard';
import ScreenWrapper from '../../components/ScreenWrapper';
import { theme } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { hp, wp } from '../../helpers/common';
import { supabase } from '../../lib/supabase';
import { fetchPosts } from '../../services/postService';


const Profile = () => {
    const [limit, setLimit] = useState(4);
    const {user, setAuth} = useAuth();
    const router = useRouter();

    const [posts, setPosts] = useState([]);
    
    const [hasMore, setHasMore] = useState(true);
    
    const onLogout = async () => {
        // setAuth(null);
        const {error} = await supabase.auth.signOut();
        if(error){
          Alert.alert('Sign out', 'Error signing out');
        }
      }
    
    useEffect(() => {
        getPosts();
    }, [])
    
    const getPosts = async () => {
        // call the api here
        if(!hasMore) return null;
        setLimit(limit + 4);
        console.log('fetching post: ', limit);
        let res = await fetchPosts(limit, user.id);
        if(res.success){
          if(posts.length === res.data.length) setHasMore(false);
          setPosts(res.data);
          
        }
      }
    
    const handleLogout = async () => {
        //show confirm modal
        Alert.alert("Confirm", "Are you sure you want to log out?", [
            {
                text: 'Cancel',
                onPress: () => console.log('Modal cancelled'),
                style: 'cancel'
            },
            {
                text: 'Log Out',
                onPress: () => onLogout(),
                style: 'destructive'
            }
        ])
    }
  return (
    <ScreenWrapper bg="white">
    {/* <UserHeader user={user} router={router} handleLogout={handleLogout}/> */}
    <FlatList data={posts} 
        ListHeaderComponent={<UserHeader user={user} router={router} handleLogout={handleLogout}/>}
        ListHeaderComponentStyle={{marginBottom: hp(10)}}
        showsHorizontalScrollIndicator={false}
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
          <View style={{marginVertical: posts.length=== 0 ? 100: 30}}>
            <Loading/>
          </View>):(
            <View style={{marginVertical: 30}}>
              <Text style={styles.noPosts}> No more posts </Text>
              </View>
          )
        )}
        />
        
    </ScreenWrapper>
  )
}

const UserHeader = ({user, router, handleLogout}) => {
    return (
        <View style={{flex: 1, backgroundColor: 'white', paddingHorizontal: wp(4)}}>
            <View style={styles.headerRow}>
                <Header title="Profile" mb={30}/>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Icon name="logout" color={theme.colors.rose}/>
                </TouchableOpacity>
            </View>
            <View style={styles.container}>
                <View style={{gap: 15}}>
                    <View style = {[styles.avatarContainer, {top: hp(5)}]}>
                    <Avatar uri={user?.image}
                    size={hp(12)}
                    rounded={theme.radius.xxl*1.4}/>
                    <Pressable style={styles.editIcon} onPress={() => router.push('editProfile')}>
                        <Icon name="edit" strokeWidth={2.5} size={20}/>
                    </Pressable>
                    </View>
                    {/* username and address */}
                    <View style={{alignItems: 'center', gap: 4}}>
                        <Text style={[styles.userName, {top: hp(5)}]}> {user && user.name}</Text>
                        <Text style={[styles.infoText, {top: hp(5)}]}> 
                            {/* {user && user.address} */}
                            New York
                            </Text>
                    </View>
                    <View style={{gap: 10, alignItems: 'center', top: hp(4)}}>
                        <View style={styles.info}>
                            <Icon name="mail" size={20} color={theme.colors.textLight}/>
                            <Text style={styles.infoText}>
                                {user && user.email}
                            </Text>
                        </View>
                        {user && user.phoneNumber && (

                        <View style={styles.info}>
                            <Icon name="call" size={20} color={theme.colors.textLight}/>
                            <Text style={styles.infoText}>
                                {user && user.phoneNumber}
                            </Text>
                        </View>
                        )}

                        {
                            user && user.bio && (
                                <Text style={styles.infoText}>Bio: {user.bio}</Text>
                            )
                        }
                    </View>
                </View>
            </View>
        </View>
    )
}

export default Profile;

const styles = StyleSheet.create({
    avatarContainer: {
        alignSelf: 'center',
        height: hp(12),
        width: hp(12),
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    container: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    editIcon: {
        backgroundColor: 'white',
        borderRadius: 50,
        bottom: 0,
        elevation: 7,
        padding: 7,
        position: 'absolute',
        right: -12,
        shadowColor: theme.colors.textLight,
        shadowOffset: { height: 4, width: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 5,
    },
    headerContainer: {
        marginHorizontal: wp(4),
        marginBottom: 20,
    },
    headerShape: {
        height: hp(20),
        width: wp(100),
    },
    info: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 10,
    },
    infoText: {
        color: theme.colors.textLight,
        fontSize: hp(1.6),
        fontWeight: '500',
    },
    listStyle: {
        paddingHorizontal: wp(4),
        paddingBottom: 30,
    },
    logoutButton: {
        position: 'absolute',
        right: 0,
        top: 7,
        backgroundColor: '#FEE2E2',
        borderRadius: theme.radius.sm,
        padding: 7,
    },
    noPosts: {
        color: theme.colors.text,
        fontSize: hp(2),
        textAlign: 'center',
    },
    userName: {
        color: theme.colors.textDark,
        fontSize: hp(3),
        fontWeight: '500',
        textAlign: 'center',

    },
});
