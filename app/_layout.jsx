// v1

// import { Stack, useRouter } from 'expo-router';
// import { useEffect } from 'react';
// import 'react-native-url-polyfill/auto';
// import { AuthProvider, useAuth } from '../contexts/AuthContext';
// import { supabase } from '../lib/supabase';
// import { getUserData } from '../services/userService';

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
//         updateUserData(session?.user);
//         router.replace('/home');
//       } else {
//         setAuth(null);
//         router.replace('/welcome');
//       }
//     });
  
//     return () => {
//       listener?.subscription?.unsubscribe();
//     };
//   }, []);

//   const updateUserData = async (user) => {
//     let res = await await getUserData(user?.id);
//     console.log('got user data: ', res)

//   }

//   return (<Stack screenOptions={{ headerShown: false }} />);
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


// import { Stack, useRouter } from 'expo-router';
// import { useEffect, useState } from 'react';
// import { ActivityIndicator, View } from 'react-native';
// import 'react-native-url-polyfill/auto';
// import { AuthProvider, useAuth } from '../contexts/AuthContext';
// import { supabase } from '../lib/supabase';
// import { restoreSession } from '../services/authService';
// import { getUserData } from '../services/userService';

// const _layout = () => {
//   return (
//     <AuthProvider>
//       <MainLayout/>
//     </AuthProvider>
//   )
// }

// const MainLayout = () => {

//   const { user, setAuth, setUserData } = useAuth();
//   const router = useRouter();
//   const [isReady, setIsReady] = useState(false);

//   useEffect(() => {
//   const restore = async () => {
//     await restoreSession();
//     const session = supabase.auth.session();
//     // console.log('Restored session:', session);
//   };
//   restore();
// }, []);

//   useEffect(() => {
//     // 1. Check existing session on app start
//     const checkInitialSession = async () => {
//       const session = supabase.auth.session();
//       setAuth(session?.user || null);
//       setIsReady(true);
//     };

//     checkInitialSession();

//     // 2. Set up auth state listener
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       async (event, session) => {
//         setAuth(session?.user || null);
//         updateUserData(session?.user)
//       }
//     );

//     return () => subscription?.unsubscribe();
//   }, []);

//   const updateUserData = async (user) => {
//     let res = await getUserData(user?.id);
//     if(res.success) setUserData(res.data);

//   }

//   useEffect(() => {
//     if (!isReady) return;
    
//     // Handle navigation based on auth state
//     if (user) {
//       router.replace('/home');
//     } else {
//       router.replace('/welcome');
//     }
//   }, [user]);

//   if (!isReady) {
//     return (
//             <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//               <ActivityIndicator size="large" />
//             </View>
//           );;
//   }

//   return <Stack screenOptions={{ headerShown: false }}>
//     <Stack.Screen name="(main)/home" />
//      </Stack>;
// };

// export default _layout;


//v4 

import { Stack, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-url-polyfill/auto';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { restoreSession } from '../services/authService';
import { getUserData } from '../services/userService';

const _layout = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

const MainLayout = () => {
  const { user, setAuth, setUserData } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      // 1. Restore session from AsyncStorage
      await restoreSession();

      // 2. Get current session after restore
      const session = supabase.auth.session();
      setAuth(session?.user || null);

      // 3. Load user data if logged in
      if (session?.user) {
        const res = await getUserData(session.user.id);
        if (res.success) setUserData({...res.data, email: session?.user.email});
      }

      setIsReady(true); // app is ready to show screen
    };

    initAuth();

    // 4. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        // console.log('session user: ', session?.user.email);
        setAuth(session?.user || null);
        if (session?.user) {
          const res = await getUserData(session.user.id);
          if (res.success) setUserData({...res.data, email: session.user.email} );
        }
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (user) {
      router.replace('/home');
    } else {
      router.replace('/welcome');
    }
  }, [isReady, user, router]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(main)/home" />
      <Stack.Screen name="(main)/postDetails" options={{presentation: 'modal'}}/>
    </Stack>
  );
};

export default _layout;