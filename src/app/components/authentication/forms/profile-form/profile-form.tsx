'use client';

import { FormEvent, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { StateGlobals } from '@/shared/global-context';
import { updateUserInDatabase } from '@/shared/server/firebase';

const getProfileForm = (user: any) => ({
    z_token_robinhood: String(user?.z_token_robinhood ?? ``),
    socket_token: String(user?.socket_token ?? user?.z_token_robinhood_socket ?? ``),
});

export default function ProfileForm() {
    const { user, setUser } = useContext<any>(StateGlobals);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(() => getProfileForm(user));

    useEffect(() => {
        setForm(getProfileForm(user));
    }, [user?.id, user?.z_token_robinhood, user?.z_token_robinhood_socket, user?.socket_token]);

    const updateFormValue = (name: string, value: string) => {
        setForm((prev: any) => ({
            ...prev,
            [name]: value,
        }));
    };

    const onInput = (e: any) => {
        const { name, value } = e?.target || {};
        if (!name) return;
        updateFormValue(name, value);
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (saving || user == null || !user?.id) return;

        const z_token_robinhood = String(form?.z_token_robinhood ?? ``).trim();
        const socket_token = String(form?.socket_token ?? ``).trim();

        if (!z_token_robinhood || !socket_token) {
            toast.error(`Both Robinhood tokens are required`);
            return;
        }

        setSaving(true);
        try {
            const updates = {
                z_token_robinhood,
                z_token_robinhood_socket: socket_token,
                socket_token,
            };
            const savedUser = await updateUserInDatabase(String(user?.id), updates as any, true);
            if (!savedUser) return;

            setUser((prev: any) => prev ? ({
                ...prev,
                ...savedUser,
            }) : prev);
            toast.success(`Robinhood tokens updated`);
        } catch (error) {
            console.error(`Robinhood token update failed`, error);
            toast.error(`Robinhood token update failed`);
        } finally {
            setSaving(false);
        }
    };

    return user == null ? <></> : <>
        <form className={`settingsForm w95 flex column gap10`} onSubmit={onSubmit}>
            <div className={`formFields gap10 justifyCenter alignStart`} style={{ marginBottom: 15 }}>
                <div className={`formField gap10 column alignStart`}>
                    <span className={`formFieldLabel`}>
                        Robinhood Authorization Token
                    </span>
                    <input 
                        required
                        type={`text`} 
                        autoComplete={`off`} 
                        spellCheck={false}
                        disabled={saving}
                        name={`z_token_robinhood`} 
                        className={`z_token_robinhood`} 
                        placeholder={`Robinhood Authorization Token`} 
                        value={form?.z_token_robinhood ?? ``}
                        onChange={onInput}
                    />
                </div>
                <div className={`formField gap10 column alignStart`}>
                    <span className={`formFieldLabel`}>
                        Robinhood Socket Token
                    </span>
                    <input 
                        required
                        type={`text`} 
                        autoComplete={`off`} 
                        spellCheck={false}
                        disabled={saving}
                        name={`socket_token`} 
                        className={`socket_token`} 
                        placeholder={`Robinhood Socket Token`} 
                        value={form?.socket_token ?? ``}
                        onChange={onInput}
                    />
                </div>
            </div>
            <button 
                type={`submit`}
                disabled={saving || !String(form?.z_token_robinhood || ``).trim() || !String(form?.socket_token || ``).trim()}
                className={`formSubmitButton formEnd`}
            >
                {saving ? `Saving Tokens` : `Save Robinhood Tokens`}
            </button>
        </form>
    </>
}
