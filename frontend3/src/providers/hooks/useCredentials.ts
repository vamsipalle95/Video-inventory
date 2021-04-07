import { useMemo, useState } from "react"
import { CognitoUser, AuthenticationDetails, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';


type UseCredentialsProps = {
    UserPoolId: string
    ClientId:   string
    DefaultUserId?: string
    DefaultPassword?: string 
}

type UseCredentialsStates = {
    userId?: string
    password?: string
    idToken?: string
    accessToken?: string
    refreshToken?: string
}

export const useCredentials = (props:UseCredentialsProps) => {
    const userPool = useMemo(()=>{
        return new CognitoUserPool({
            UserPoolId: props.UserPoolId, 
            ClientId: props.ClientId
        })
    },[])// eslint-disable-line

    const [ state, setState] = useState<UseCredentialsStates>({
        userId: props.DefaultUserId,
        password: props.DefaultPassword,
    })



    // (1) Sign in
    const handleSignIn = async (inputUserId: string, inputPassword: string)=> {
        const authenticationDetails = new AuthenticationDetails({
            Username: inputUserId,
            Password: inputPassword
        })
        const cognitoUser = new CognitoUser({
            Username: inputUserId,
            Pool: userPool
        })

        const p = new Promise<void>((resolve, reject)=>{
            cognitoUser.authenticateUser(authenticationDetails, {
                onSuccess: (result) => {
                    const accessToken = result.getAccessToken().getJwtToken()
                    const idToken = result.getIdToken().getJwtToken()
                    const refreshToken = result.getRefreshToken().getToken()
                    setState( {...state,  idToken:idToken, accessToken:accessToken, refreshToken:refreshToken})
                    resolve()
                },
                onFailure: (err) => {
                    console.log("signin error:", err)
                    reject(err)
                }
            })
        })
        return p
    }


    // (2) Sign up
    const handleSignUp = async (inputUserId: string, inputPassword: string) => {
        const attributeList = [
            new CognitoUserAttribute({
                Name: 'email',
                Value: inputUserId
            })
        ]
        const p = new Promise<void>((resolve, reject)=>{
            userPool.signUp(inputUserId, inputPassword, attributeList, [], (err, result) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve()
            })
        })
        return p
    }

    // (3) Verify Code
    const handleVerify = async (inputUserId: string, inputVerifyCode: string):Promise<void> => {
        const cognitoUser = new CognitoUser({
            Username: inputUserId,
            Pool: userPool
        })

        const p = new Promise<void>((resolve, reject)=>{
            cognitoUser.confirmRegistration(inputVerifyCode, true, (err: any) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve()
            })
        })
        return p
    }

    // (4) Resend Verify Code
    const handleResendVerification = async (inputUserId: string)=> {
        const cognitoUser = new CognitoUser({
            Username: inputUserId,
            Pool: userPool
        })
        const p = new Promise<void>((resolve, reject)=>{
            cognitoUser.resendConfirmationCode((err: any) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve()
            })
        })
        return p
    }

    // (5) Forgot Password
    const handleSendVerificationCodeForChangePassword = async (inputUserId: string) => {
        const cognitoUser = new CognitoUser({
            Username: inputUserId,
            Pool: userPool
        })

        const p = new Promise<void>((resolve, reject)=>{
            cognitoUser.forgotPassword({
                onSuccess: (data) => {
                    resolve()
                },
                onFailure: (err) => {
                    reject(err)
                }
            })
        })
        return p
    }

    // (6) New Password
    const handleNewPassword = async (inputUserId: string, inputVerifycode: string, inputPassword: string) => {
        const cognitoUser = new CognitoUser({
            Username: inputUserId,
            Pool: userPool
        })

        const p = new Promise<void>((resolve, reject)=>{
            cognitoUser.confirmPassword(inputVerifycode, inputPassword, {
                onSuccess: () => {
                    resolve()
                },
                onFailure: (err) => {
                    reject(err)
                }
            })
        })
        return p
    }


    // (x) Sign out
    const handleSignOut = async (inputUserId: string) => {
        const cognitoUser = new CognitoUser({
            Username: inputUserId,
            Pool: userPool
        })
        cognitoUser.signOut()
        setState( {...state, userId:"", password:"", idToken:"", accessToken:"", refreshToken:""})
    }


    return {
        ...state, 
        handleSignIn, 
        handleSignUp, 
        handleVerify, 
        handleResendVerification, 
        handleSendVerificationCodeForChangePassword, 
        handleNewPassword,
        handleSignOut
    }
}

