'use client';

import { toast } from 'react-toastify';
import {  Button } from '@mui/material';
import { useContext, useRef } from 'react';
import { User } from '@/shared/types/models/User';
import Loader from '@/app/components/loaders/loader';
import { StateGlobals } from '@/shared/global-context';
import AvatarComponent from '@/app/components/avatar/avatar';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { AuthStates, Providers, Roles, Types } from '@/shared/types/types';
import { addUserToDatabase, auth, renderFirebaseAuthErrorMessage } from '@/shared/server/firebase';
import { findHighestNumberInArrayByKey, logToast, stringNoSpaces } from '@/shared/scripts/constants';

const { Next, Sign_Up, Sign_In, Sign_Out } = AuthStates;

const stateLabels: any = {
    [Next]: `${Sign_Up} or ${Sign_In}`,
}

export default function AuthForm({ style = { opacity: 1 } }: any) {
    let emailOrUsernameField = useRef(null);

    const { user, users, loaded, authState, setAuthState, signInUser, onSignOut } = useContext<any>(StateGlobals);

    const onAuthFormSubmit = async (onFormSubmitEvent: any) => {
        onFormSubmitEvent?.preventDefault();

        if (authState == AuthStates.Sign_Out) {
            onSignOut();
            return;
        }

        const form = onFormSubmitEvent?.target;
        const formData = new FormData(form);
        const formValues = Object.fromEntries(formData?.entries());

        let { email, password } = formValues;

        if (email && email != ``) {
            if (password && password != ``) {
                email = String(email);
                password = String(password);

                if (authState == AuthStates.Sign_In) {
                    form.reset();
                    signInUser(email, password);
                    return;
                }

                let type = Types.User;
                let newIndex = users.length;

                createUserWithEmailAndPassword(auth, email, password).then(async (userCredential: any) => {
                    if (userCredential != null) {
                        let { 
                            uid, 
                            photoURL: avatar, 
                            displayName: name, 
                            phoneNumber: phone, 
                            accessToken: z_token, 
                            isAnonymous: anonymous, 
                            emailVerified: verified, 
                        } = userCredential?.user;

                        let highestRank = await findHighestNumberInArrayByKey(users, `number`) ?? newIndex;
                        let number = highestRank + 1;

                        email = String(email);

                        let newUser: any = new User({ 
                            type, 
                            email, 
                            number, 
                            role: Roles.Owner, 
                            provider: Providers.Firebase, 

                            uid,
                            name,
                            z_token,
                            verified,
                            anonymous,
                            
                            phone: phone ?? ``,
                            avatar: avatar ?? ``,
                        }); 

                        await addUserToDatabase(newUser).then(async () => {
                            logToast(`Created User`, newUser?.name, false, newUser);
                            form.reset();
                            signInUser(email, password);
                        }).catch(signUpAndSeedError => {
                            let errorMessage = `Error on Sign Up & Set Default Data`;
                            console.log(errorMessage, signUpAndSeedError);
                            toast.error(errorMessage);
                            return;
                        });
                    }
                }).catch((error) => {
                    console.log(`Error Signing Up`, error);
                    const errorMessage = error.message;
                    if (errorMessage) {
                        // if (errorMessage?.includes(`email-already-in-use`)) {
                            // switchToSignIn(email, password);
                            // setUser()
                        // } else {
                            toast.error(renderFirebaseAuthErrorMessage(errorMessage));  
                        // }         
                    } else {
                        toast.error(`Error Signing Up`);
                    }
                    return;
                });
            } else {
                if (users && users.length > 0) {
                    let thisUser = users.find((u: User) => u?.email?.toLowerCase()?.includes(String(email)?.toLowerCase()));
                    if (thisUser) {
                        setAuthState(Sign_In);
                    } else {
                        setAuthState(Sign_Up);
                    }
                } else {
                    setAuthState(Sign_Up);
                }
            }
        }
    }

    return (
        <div style={style} className={`formContainer authFormContainer authFormContainer_${stringNoSpaces(authState)}`}>
            {!loaded ? (
                <Loader height={52} label={`Users Loading`} style={{ background: `var(--blackGlass) !important`, [`--animation-delay`]: `${2 * 0.15}s` }} />
            ) : <>
                {user != null && (
                    <AvatarComponent style={{ position: `relative`, top: -2 }} />
                )}
                <form className={`form authForm`} onSubmit={(e) => onAuthFormSubmit(e)}>
                    {authState != Sign_Out && (
                        <div className={`formFields`}>
                            <div className={`mainFormField formField gap10 column alignStart`}>
                                <span className={`formFieldLabel`}>
                                    {stateLabels[authState] ?? authState}
                                </span>
                                <input ref={emailOrUsernameField} name={`email`} type={`email`} className={`email`} placeholder={`Email Address`} autoComplete={`off`} required />
                            </div>
                            {authState != Next && (
                                <div className={`formField gap10 column alignStart`}>
                                    <input name={`password`} minLength={6} type={`password`} className={`password`} placeholder={`Password`} autoFocus autoComplete={`off`} required />
                                </div>
                            )}
                        </div>
                    )}
                    <Button className={`formSubmitButton formEnd`} type={`submit`}>
                        {authState}
                    </Button>
                </form>
                {/* {user == null && <Avatar id={`authFormAvatar`} className={`avatar formEnd`} />} */}
            </>}
        </div>
    )
}