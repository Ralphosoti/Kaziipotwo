import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {Octicons, Ionicons, Fontisto} from "@expo/vector-icons";
import { Colors, PasswordValidationText } from "../components/styles";
import { useUserContext } from "../userContext";

import { 
    StyledContainer, 
    InnerContainer, 
    PageLogo, 
    PageTitle, 
    StyledFormArea, 
    SubTitle,
    LeftIcon,
    StyledInputLabel,
    StyledTextInput,
    RightIcon,
    StyledButton,
    ButtonText,
    AlertBox,
    Line,
    ExtraView,
    ExtraText,
    TextLink,
    TextLinkContent 
} from "../components/styles";

import { Formik } from "formik";
import { View, ActivityIndicator } from "react-native";
import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";
import firebase from "../firebase";
import { StyleSheet } from "react-native";

const Login = ({navigation}) =>{

    const [hidePass, setHidePass] = useState(true);
    const [message, setMessage] = useState();
    const [messageType, setMessageType] = useState();

    const { setUser } = useUserContext(); 

    const handleSignIn = (credentials, setSubmitting, resetForm) => {
        handleMessage(null);
        const { email, password } = credentials;
        firebase.auth().
        signInWithEmailAndPassword(email, password)
        .then(userCredentials => {
            const user = userCredentials.user;
            setUser(user);
            setSubmitting(false);
            navigation.reset({
                index: 0,
                routes: [{ name: 'welcome' }] 
            });
            navigation.navigate('welcome', {...user});
            resetForm();
        })
        .catch(error => {
            console.log(error);
            setSubmitting(false);
            if (error.code === 'auth/user-not-found') {
                const errorMessage = 'A user with that email was not found.';
                handleMessage(errorMessage, 'failed');
            } else if (error.code === 'auth/wrong-password') {
                const errorMessage = 'Incorrect Email or Password.';
                handleMessage(errorMessage, 'failed');
            }else {
                const errorMessage = 'Something went wrong. Please try again.';
                handleMessage(errorMessage, 'failed');
            }
        })
    }


    const handleGoogleSignIn = async () => {
        handleMessage(null);
        try {
          const result = await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
          const user = result.user;
          setUser(user);
          navigation.navigate('welcome', { ...user });
        } catch (error) {
          console.log(error);
          if (error.code === 'auth/user-not-found') {
            const errorMessage = 'A user with that email was not found.';
            handleMessage(errorMessage, 'failed');
          } else {
            const errorMessage = 'Something went wrong. Please try again.';
            handleMessage(errorMessage, 'failed');
          }
        }
      };
      

    const handleMessage = (message, messageType = 'failed') => {
        setMessage(message);
        setMessageType(messageType);
    }

    const validatePassword = (password) => {
        const minLength = 6;
        const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
      
        if (password.length < minLength) {
          return 'Password must be at least 6 characters long.';
        }
      
        if (!specialCharRegex.test(password)) {
          return 'Password must contain at least one special character.';
        }
      
        return null;
      };
      

    return (
        <KeyboardAvoidingWrapper>
        <StyledContainer>
            <StatusBar style="dark" />
            <InnerContainer>
            <PageLogo resizeMode="cover" source={require('./../assets/img/LOGO2.png')} />
            <SubTitle>Login To Your Account</SubTitle>
            <AlertBox type={messageType}>{message}</AlertBox>
            <Formik
                initialValues={{email: '', password: ''}}
                onSubmit={(values,  {setSubmitting, resetForm}) =>{
                    if(values.email == '' || values.password == ''){
                        setMessage('Please fill out all fields');
                        setSubmitting(false);
                    }else{
                        handleSignIn(values, setSubmitting, resetForm);
                    }
                }}
            >
            {
                ({handleChange, handleBlur, handleSubmit, values, isSubmitting, resetForm})=> (
                    <StyledFormArea>
                        <LoginTextInput
                        label="Email Address"
                        icon="mail"
                        placeholder="john@gmail.com"
                        placeholderTextColor={Colors.darkLight}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        value={values.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCompleteType="email"
                        textContentType="emailAddress"
                        />
                        <LoginTextInput
                        label="Password"
                        icon="lock"
                        placeholder="* * * * * * * * * * *"
                        placeholderTextColor={Colors.darkLight}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        value={values.password}
                        secureTextEntry={hidePass}
                        isPassword={true}
                        hidePass={hidePass}
                        setHidePass={setHidePass}
                        />
                        {!isSubmitting && <StyledButton onPress={handleSubmit}>
                            <ButtonText>Sign In</ButtonText>
                        </StyledButton>}
                        {isSubmitting && <StyledButton disabled={true}>
                            <ActivityIndicator size={"large"} color={Colors.primary}/>
                        </StyledButton>}
                        <Line/>
                        <ExtraView>
                            <ExtraText>Don't have an account? </ExtraText>
                            <TextLink onPress={()=>navigation.navigate('SignUp')}>
                                <TextLinkContent>
                                    SignUp
                                </TextLinkContent>
                            </TextLink>
                        </ExtraView>
                    </StyledFormArea>
                )
            }
            </Formik>
            </InnerContainer>
        </StyledContainer>
        </KeyboardAvoidingWrapper>
    );
}


const LoginTextInput = ({label, icon, isPassword, hidePass, setHidePass, ...props}) => {
    return (
        <View>
            <LeftIcon>
            <Octicons name={icon} size={30} color={Colors.brand}/>
            </LeftIcon>
            <StyledInputLabel>{label}</StyledInputLabel>
            <StyledTextInput {...props}/>
            {isPassword &&(
                <RightIcon onPress={()=> setHidePass(!hidePass)}>
                    <Ionicons name={hidePass ? 'md-eye-off' : 'md-eye'} size={30} color={Colors.darkLight}/>
                </RightIcon>
            )}
        </View>
    )
}


export default Login;