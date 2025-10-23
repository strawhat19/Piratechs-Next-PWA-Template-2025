'use client';

import './avatar.scss';

import { useContext } from 'react';
import { Avatar } from '@mui/material';
import { State } from '../container/container';

export default function AvatarComponent({ 
    style,
    size = 30,
    width = size,
    height = size,
    userAvatar = true, 
    borderRadius = 100,
    className = `avatar`, 
    id = `authFormAvatar`,
    background = `var(--blueopac)`, 
}: any) {
    let { user } = useContext<any>(State);

    return <>
        <div className={`avatarComponent`} style={{ ...style, width, minWidth: width, height }}>
            {(userAvatar && user != null) ? (
                <div className={`avatarComponentBG`} style={{ background, borderRadius }}>
                    <div className={`avatarComponentChar`}>
                        {user?.name[0]}
                    </div>
                </div>
            ) : <Avatar id={id} className={className} />}
        </div>
    </>
}