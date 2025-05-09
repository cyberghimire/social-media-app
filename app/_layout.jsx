// import { Stack, useRouter } from 'expo-router';
// import React, { useEffect } from 'react';
// import 'react-native-url-polyfill/auto';
// import { AuthProvider, useAuth } from '../contexts/AuthContext';
// import { supabase } from '../lib/supabase';

// const _layout = () => {
//   return (
//     <AuthProvider>
//       <MainLayout/>
//     </AuthProvider>
//   )
// }

// const MainLayout = () => {
//   const { setAuth } = useAuth();
//   const router = useRouter();

//   useEffect(() => {
//     const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
//       console.log('session user', session?.user?.email)
      
//       if (session) {
//         setAuth(session.user);
//         router.replace('/home');
//       } else {
//         setAuth(null);
//         router.replace('/welcome');
//       }
//     });
  
//     // return () => {
//     //   listener?.subscription?.unsubscribe();
//     // };
//   }, []);

//   return <Stack screenOptions={{ headerShown: false }} />;
// };



// export default _layout



// v2

// import { Stack, useRouter } from 'expo-router';
// import React, { useEffect, useState } from 'react';
// import { ActivityIndicator, View } from 'react-native';
// import 'react-native-url-polyfill/auto';
// import { AuthProvider, useAuth } from '../contexts/AuthContext';
// import { supabase } from '../lib/supabase';

// const _layout = () => {
//   return (
//     <AuthProvider>
//       <MainLayout/>
//     </AuthProvider>
//   )
// }

// const MainLayout = () => {
//   const { user, setAuth } = useAuth();
//   const router = useRouter();
//   const [isReady, setIsReady] = useState(false);

//   useEffect(() => {
//     // Only check auth if we don't already have a user
//     if (user === undefined) {
//       const session = supabase.auth.session();
//       setAuth(session?.user || null);
//     }
//     setIsReady(true);

//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       (event, session) => {
//         setAuth(session?.user || null);
//       }
//     );

//     return () => subscription?.unsubscribe();
//   }, []);

//   useEffect(() => {
//     if (!isReady) return;
    
//     // Handle navigation based on auth state
//     if (user) {
//       if (router.canGoBack()) {
//         router.back();
//       } else {
//         router.replace('/home');
//       }
//     } else {
//       router.replace('/welcome');
//     }
//   }, [user, isReady]);

//   if (!isReady) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return <Stack screenOptions={{ headerShown: false }} />;
// };

// export default _layout;



//v3


import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-url-polyfill/auto';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { getUserData } from '../services/userService';

const _layout = () => {
  return (
    <AuthProvider>
      <MainLayout/>
    </AuthProvider>
  )
}

const MainLayout = () => {
  const { user, setAuth, setUserData } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Check existing session on app start
    const checkInitialSession = async () => {
      const session = supabase.auth.session();
      setAuth(session?.user || null);
      setIsReady(true);
    };

    checkInitialSession();

    // 2. Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuth(session?.user || null);
        updateUserData(session?.user)
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  const updateUserData = async (user) => {
    let res = await getUserData(user?.id);
    if(res.success) setUserData(res.data);

  }

  useEffect(() => {
    if (!isReady) return;
    
    // Handle navigation based on auth state
    if (user) {
      router.replace('/home');
    } else {
      router.replace('/welcome');
    }
  }, [user, isReady]);

  if (!isReady) {
    return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" />
            </View>
          );;
  }

  return <Stack screenOptions={{ headerShown: false }}>
    <Stack.Screen name="debug" />
  </Stack>;
};

export default _layout;