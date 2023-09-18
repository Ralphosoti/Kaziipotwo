import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {Octicons, Ionicons, Fontisto} from "@expo/vector-icons";
import { Colors, PasswordValidationText } from "../components/styles";
import DateTimePicker from '@react-native-community/datetimepicker';

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

import { Form, Formik } from "formik";
import { View } from "react-native";
import { TouchableOpacity } from "react-native";
import KeyboardAvoidingWrapper from "../components/KeyboardAvoidingWrapper";
import { ActivityIndicator } from "react-native";
import { useUserContext } from "../userContext";
import firebase from "../firebase";

const SignUp = ({navigation}) =>{

    const [hidePass, setHidePass] = useState(true);
    const [show, setShow] = useState(false);
    const [date, setDate] = useState(new Date(1990, 0, 1));

    const [message, setMessage] = useState();
    const [messageType, setMessageType] = useState();

    const { setUser } = useUserContext(); 

    const [dob, setDob] = useState();

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShow(false);
        setDate(currentDate);
        setDob(currentDate);
    } 

    const showDatePicker = () => {
        setShow(true);
    }

    const handleSignUp = (credentials, setSubmitting, resetForm) => {
        handleMessage(null);
        const { fullName, email, dateOfBirth, password, confirmPassword } = credentials;
        firebase.auth().
        createUserWithEmailAndPassword(email, password)
        .then(async userCredentials => {
            const user = userCredentials.user;
            try {
                await firebase.firestore().collection("users").doc(user.uid).set({
                    fullName: fullName,
                    email: email,
                    dateOfBirth: dateOfBirth,
                });
            } catch (error) {
                console.log("Error storing user data:", error);
            }
            setUser(user);
            setSubmitting(false);
            navigation.navigate('welcome', {...user});
            resetForm();
        })
        .catch(error => {
            console.log(error);
            setSubmitting(false);
            if (error.code === 'auth/email-already-in-use') {
                const errorMessage = 'A user with that email already exist.';
                handleMessage(errorMessage, 'failed');
            }else if(error.code === 'auth/weak-password'){
                const errorMessage = 'Please use a stronger password!.';
                handleMessage(errorMessage, 'failed');
            }else {
                const errorMessage = 'Something went wrong. Please try again.';
                handleMessage(errorMessage, 'failed');
            }
        })
    }

    const handleMessage = (message, messageType = 'failed') => {
        setMessage(message);
        setMessageType(messageType);
    }
    return (
        <KeyboardAvoidingWrapper>
        <StyledContainer>
            <StatusBar style="dark" />
            <InnerContainer>
            <PageLogo resizeMode="cover" source={require('./../assets/img/LOGO2.png')} />
            <SubTitle>Create an Account</SubTitle>

            {show && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onChange}
                />
            )}

            <AlertBox type={messageType}>{message}</AlertBox>
            <Formik
                initialValues={{fullName: '', email: '', dateOfBirth: '',  password: '', confirmPassword: ''}}
                onSubmit={(values, {setSubmitting, resetForm}) =>{
                    if(values.fullName == '' || values.email == '' || values.password == '' || values.confirmPassword == ''){
                        setMessage('Please fill out all fields');
                        setSubmitting(false);
                    } else if(values.password != values.confirmPassword){
                        setMessage('Passwords, do not match');
                        setSubmitting(false);
                    }
                    else{
                        handleSignUp(values, setSubmitting, resetForm);
                    }
                }}
            >
            {
                ({handleChange, handleBlur, handleSubmit, values, isSubmitting, resetForm})=> (
                    <StyledFormArea>
                        <SignUpText
                        label="Full Name"
                        icon="person"
                        placeholder="Ochieng John"
                        placeholderTextColor={Colors.darkLight}
                        onChangeText={handleChange('fullName')}
                        onBlur={handleBlur('fullName')}
                        value={values.fullName}
                        keyboardType="email-address"
                        />
                        <SignUpText
                        label="Email Address"
                        icon="mail"
                        placeholder="john@gmail.com"
                        placeholderTextColor={Colors.darkLight}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        value={values.email}
                        keyboardType="email-address"
                        />
                        <SignUpText
                        label="Date of Birth"
                        icon="calendar"
                        placeholder="YYYY/MM/DD"
                        placeholderTextColor={Colors.darkLight}
                        onChangeText={handleChange('dateOfBirth')}
                        onBlur={handleBlur('dateOfBirth')}
                        value={dob? dob.toDateString() : ''}
                        isDate={true}
                        editable={false}
                        showDatePicker={showDatePicker}
                        />
                        <SignUpText
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
                        <SignUpText
                        label="Confirm Password"
                        icon="lock"
                        placeholder="* * * * * * * * * * *"
                        placeholderTextColor={Colors.darkLight}
                        onChangeText={handleChange('confirmPassword')}
                        onBlur={handleBlur('confirmPassword')}
                        value={values.confirmPassword}
                        secureTextEntry={hidePass}
                        isPassword={true}
                        hidePass={hidePass}
                        setHidePass={setHidePass}
                        />
                        {!isSubmitting && <StyledButton onPress={handleSubmit}>
                            <ButtonText>Sign Up</ButtonText>
                        </StyledButton>}
                        {isSubmitting && <StyledButton disabled={true}>
                            <ActivityIndicator size={"large"} color={Colors.primary}/>
                        </StyledButton>}
                        <Line/>
                        <ExtraView>
                            <ExtraText>ALready have an account? </ExtraText>
                            <TextLink onPress={()=> navigation.navigate('Login')}>
                                <TextLinkContent>
                                    Login
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


const SignUpText = ({label, icon, isPassword, hidePass, setHidePass, isDate, showDatePicker, ...props}) => {
    return (
        <View>
            <LeftIcon>
            <Octicons name={icon} size={30} color={Colors.brand}/>
            </LeftIcon>
            <StyledInputLabel>{label}</StyledInputLabel>
            {!isDate && <StyledTextInput {...props}/>}
            {isDate && <TouchableOpacity onPress={showDatePicker}>
                <StyledTextInput {...props}/>
                </TouchableOpacity>}
            {isPassword &&(
                <RightIcon onPress={()=> setHidePass(!hidePass)}>
                    <Ionicons name={hidePass ? 'md-eye-off' : 'md-eye'} size={30} color={Colors.darkLight}/>
                </RightIcon>
            )}
            {isPassword && props.value.length > 0 && (
            <PasswordValidationText>
            {validatePassword(props.value)}
            </PasswordValidationText>
        )}
        </View>
    )
}


const validatePassword = (password) => {
    const minLength = 6;
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
  
    if (password.length < minLength) {
      return "Password must be at least 6 characters long.";
    }
  
    if (!specialCharRegex.test(password)) {
      return "Must contain at least one special character.";
    }
  
    return null;
  };


export default SignUp;