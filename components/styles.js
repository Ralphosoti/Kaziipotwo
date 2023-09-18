import styled from 'styled-components/native';
import Constants from 'expo-constants';
import { View, Image, Text } from 'react-native';
const statusBarHeight = Constants.statusBarHeight;

export const Colors = {
    primary: '#ffffff',
    secondary: '#E5E7EB',
    tertiary: '#1F2938',
    darkLight: '#9CA3AF',
    brand: '#414757',
    green: '#10B981',
    red:'#EF4444',
};

const {primary, secondary, tertiary, darkLight, brand, green, red} = Colors;

export const StyledContainer = styled.View`
    flex:1;
    padding:25px;
    padding-top: ${statusBarHeight + 120}px;
    background-color: ${primary};
    height:100vh;
`;

export const InnerContainer = styled.View`
    flex:1;
    width:100%;
    align-items: center;
`;

export const PageLogo = styled.Image`
    width: 100%;
    height: 180px;
`;

export const PageTitle = styled.Text`
    font-size: 30px;
    text-align: center;
    font-weight:bold;
    color: ${brand};
    padding: 10px;
`;


export const SubTitle = styled.Text`
    font-size:18px;
    margin-bottom: 20px;
    letter-spacing: 1px;
    font-weight: bold;
    color: ${tertiary};
`;

export const StyledFormArea = styled.View`
    width:90%;
`;

export const StyledTextInput = styled.TextInput`
    background-color: ${secondary};
    padding:15px;
    padding-left: 55px;
    padding-right: 55px;
    border-radius: 5px;
    font-size: 16px;
    height: 60px;
    margin-vertical: 3px;
    margin-bottom: 10px;
    color: ${tertiary};
`;

export const StyledInputLabel = styled.Text`
    color:${tertiary};
    font-size: 13px;
    text-align: left;
`;

export const LeftIcon = styled.View`
    left: 15px;
    top: 38px;
    position: absolute;
    z-index: 1;
`;

export const RightIcon = styled.TouchableOpacity`
    right: 15px;
    top: 38px;
    position: absolute;
    z-index: 1;
`;

export const StyledButton = styled.TouchableOpacity`
    padding: 15px;
    background-color: ${brand};
    justify-content: center;
    align-items: center;
    border-radius: 5px;
    margin-vertical: 5px;
    height: 60px;
    ${(props) => props.google == true && `
        background-color: ${red};
        flex-direction:row;
        justify-content: center;
        height: 49px;
    `}
`;

export const ButtonText = styled.Text`
    color: ${primary};
    font-size: 16px;
    ${(props) => props.google == true && `
        padding-left: 10px;
        font-size: 13px;
    `}
`;

export const AlertBox = styled.Text`
    text-align: center;
    font-size: 13px;
    color: ${props => props.type == 'SUCCESS' ? green : red};
`;

export const PasswordValidationText = styled.Text`
    position:absolute;
    top:-12px;
    text-align: center;
    font-size: 13px;
    color: red;
`;

export const Line = styled.View`
    height: 1px;
    width: 100%;
    background-color:${darkLight};
    margin-vertical: 10px;
`;

export const ExtraView = styled.View`
    justify-content: center;
    flex-direction: row;
    align-items: center;
    padding: 10px;
`;

export const ExtraText = styled.Text`
    justify-content: center;
    align-content: center;
    color: ${tertiary};
    font-size: 15px;
`;

export const TextLink = styled.TouchableOpacity`
    justify-content: center;
    align-items: center;
`;

export const TextLinkContent = styled.Text`
    color:${brand};
    font-size: 15px;
`;