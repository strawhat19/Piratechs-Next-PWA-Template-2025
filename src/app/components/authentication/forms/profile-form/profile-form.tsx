'use client';

import { useContext } from 'react';
import { StateGlobals } from '@/shared/global-context';

export default function ProfileForm() {
    let { user } = useContext<any>(StateGlobals);
    return user == null ? <></> : <>
        <form className={`settingsForm w95`}>
            <div className={`formFields`}>
                <div className={`formField gap10 column alignStart`}>
                    <span className={`formFieldLabel`}>
                        Robinhood Authorization Token
                    </span>
                    <input type={`text`} name={`z_token_robinhood`} className={`z_token_robinhood`} placeholder={`Robinhood Authorization Token`} autoComplete={`off`} />
                </div>
            </div>
        </form>
    </>
}