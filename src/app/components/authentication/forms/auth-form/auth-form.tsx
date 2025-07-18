'use client';

import { useContext } from 'react';
import { toast } from 'react-toastify';
import { Avatar, Button } from '@mui/material';
import { Data } from '@/shared/types/models/Data';
import { State } from '@/app/components/container/container';
import { AuthStates, Providers, Roles, Types } from '@/shared/types/types';

const { Next, Sign_Up, Sign_In, Sign_Out } = AuthStates;

const stateLabels: any = {
    [Next]: `${Sign_Up} or ${Sign_In}`,
}

export default function AuthForm() {
    const { user, authState, setAuthState } = useContext<any>(State);

    const onAuthFormSubmit = (onFormSubmitEvent: any) => {
        onFormSubmitEvent?.preventDefault();

        const form = onFormSubmitEvent?.target;
        const formData = new FormData(form);
        const formValues = Object.fromEntries(formData?.entries());

        let { email, password } = formValues;

        if (email && email != ``) {
            if (password && password != ``) {
                email = String(email);
                password = String(password);

                let newUser: any = new Data({ type: Types.User, number: 19, email, password });
                newUser = { ...newUser, provider: Providers.Firebase, role: Roles.Administrator };

                // toast.success(`Ready for ${authState}`);    
                console.log(`Ready for ${authState}`, newUser);
                toast.success(`Registration in Development!`);    
            } else {
                // if (users) {

                // } else {
                    setAuthState(Sign_Up);
                // }
            }
        }
    }

    return (
        <div className={`formContainer authFormContainer`}>
            {user != null && <Avatar id={`authFormAvatar`} className={`avatar`} />}
            <form className={`form authForm`} onSubmit={(e) => onAuthFormSubmit(e)}>
                {authState != Sign_Out && (
                    <div className={`formFields`}>
                        <div className={`mainFormField formField gap10 column alignStart`}>
                            <span className={`formFieldLabel`}>
                                {stateLabels[authState] ?? authState}
                            </span>
                            <input name={`email`} type={`email`} className={`email`} placeholder={`Email Address`} required />
                        </div>
                        {authState != Next && (
                            <div className={`formField gap10 column alignStart`}>
                                <input name={`password`} minLength={6} type={`password`} className={`password`} placeholder={`Password`} autoFocus required />
                            </div>
                        )}
                    </div>
                )}
                <Button className={`formSubmitButton formEnd`} type={`submit`}>
                    {authState}
                </Button>
            </form>
            {user == null && <Avatar id={`authFormAvatar`} className={`avatar formEnd`} />}
        </div>
    )
}