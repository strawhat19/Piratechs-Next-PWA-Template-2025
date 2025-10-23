'use client';

import { toast } from 'react-toastify';
import { useContext, useRef } from 'react';
import { Avatar, Button } from '@mui/material';
import { User } from '@/shared/types/models/User';
import Loader from '@/app/components/loaders/loader';
import { logToast } from '@/shared/scripts/constants';
import { State } from '@/app/components/container/container';
import { addUserToDatabase } from '@/shared/server/firebase';
import { AuthStates, Providers, Roles, Types } from '@/shared/types/types';

const { Next, Sign_Up, Sign_In, Sign_Out } = AuthStates;

const stateLabels: any = {
    [Next]: `${Sign_Up} or ${Sign_In}`,
}

export default function AuthForm() {
    let emailOrUsernameField = useRef(null);
    const { user, users, loaded, authState, setAuthState, refreshUsers } = useContext<any>(State);

    const onAuthFormSubmit = async (onFormSubmitEvent: any) => {
        onFormSubmitEvent?.preventDefault();

        const form = onFormSubmitEvent?.target;
        const formData = new FormData(form);
        const formValues = Object.fromEntries(formData?.entries());

        let { email, password } = formValues;

        if (email && email != ``) {
            if (password && password != ``) {
                email = String(email);
                password = String(password);

                let type = Types.User;
                let newIndex = users.length + 1;

                let newUser: any = new User({ type, email, number: newIndex, provider: Providers.Firebase, role: Roles.Owner }); 

                await addUserToDatabase(newUser).then(async () => {
                    logToast(`Created User`, newUser?.name, false, newUser);
                    form.reset();
                    refreshUsers();
                }).catch(signUpAndSeedError => {
                    let errorMessage = `Error on Sign Up & Set Default Data`;
                    console.log(errorMessage, signUpAndSeedError);
                    toast.error(errorMessage);
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
        <div className={`formContainer authFormContainer`}>
            {!loaded ? (
                <Loader height={52} label={`Users Loading`} style={{ background: `var(--blackGlass) !important`, [`--animation-delay`]: `${2 * 0.15}s` }} />
            ) : <>
                {user != null && <Avatar id={`authFormAvatar`} className={`avatar`} />}
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