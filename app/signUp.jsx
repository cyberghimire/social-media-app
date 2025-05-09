import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import React, { useRef, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import Icon from '../assets/icons'
import BackButton from '../components/BackButton'
import Button from '../components/Button'
import Input from '../components/Input'
import ScreenWrapper from '../components/ScreenWrapper'
import { theme } from '../constants/theme'
import { hp, wp } from '../helpers/common'
import { supabase } from '../lib/supabase'

const SignUp = () => {
    const router= useRouter();
    const emailRef = useRef("");
    const nameRef = useRef("");
    const passwordRef = useRef("");
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        if(!emailRef.current || !passwordRef.current){
            Alert.alert('Sign Up', 'Please fill all the fields!')
            return;
        }
        let name = nameRef.current.trim();
        let email = emailRef.current.trim();
        let password = passwordRef.current.trim();

        setLoading(true);

        try {
            const { session, error } = await supabase.auth.signUp({
                email,
                // options:  {
                //     data: {
                //         name: name
                //     }
                // },
                password
            });

            // After signUp
            await supabase.from('users').insert({
                id: session.user.id,
                name: name
            });
  

            // if (error) {
                // console.error('Signup error:', error);
                // Optionally show an error message to the user
            // } else {
                // console.log('Signup success:', session);
                // Alert('Signup Success', data)
            // }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false); // Always runs, even if an error is thrown
        }
    }

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark"/>
      <View style={styles.container}>
        <BackButton router={router}/>
        {/* Welcome  */}
        <View>
            <Text style={styles.welcomeText}> Let&apos;s </Text>
            <Text style={styles.welcomeText}> Get Started </Text>
        </View>
        {/* form  */}
         <View style={styles.form}>
            <Text style={{fontSize: hp(1.5), color: theme.colors.text}}>
                Please fill the details to create an account
            </Text>
            <Input icon={<Icon name="user" size={26} strokeWidth={1.6}/>}
            placeholder="Enter your Name" onChangeText={value=> nameRef.current = value}/>
            <Input icon={<Icon name="mail" size={26} strokeWidth={1.6}/>}
            placeholder="Enter your email" onChangeText={value=> emailRef.current = value}/>
            <Input icon={<Icon name="lock" size={26} strokeWidth={1.6}/>}
            placeholder="Enter your password" secureTextEntry onChangeText={value=> passwordRef.current = value}/>

           
            {/* button  */}
            <Button title={'Sign Up'} loading={loading} onPress={onSubmit} buttonStyle={{marginTop: hp(0)}}/>
         </View>
         <View style={styles.footer}>
            <Text style={styles.footerText}>
                Already have an account?
            </Text>
            <Pressable onPress={() => router.push('login')}>
                <Text style={[styles.footerText, {color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold}]}> Login</Text>
            </Pressable>
         </View>
      </View>
    </ScreenWrapper>
  )
}

export default SignUp

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 45,
        paddingHorizontal: wp(5),
    },
    forgotPassword: {
        color: theme.colors.text,
        fontWeight: theme.fonts.semibold,
        textAlign: 'right',
    },
    form: {
        gap: 25,
    },
    footer: {
        alignItems: 'center',
        flexDirection: 'row',
        gap: 5,
        justifyContent: 'center',
    },
    footerText: {
        color: theme.colors.text,
        textAlign: 'center',
        fontSize: hp(1.6),
    },
    welcomeText: {
        color: theme.colors.text,
        fontSize: hp(4),
        fontWeight: theme.fonts.bold,
    },
})