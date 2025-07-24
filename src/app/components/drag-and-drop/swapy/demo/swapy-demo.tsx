'use client';

import './swapy-demo.scss';

import { Menu } from '@mui/icons-material';
import { User } from '@/shared/types/models/User';
import Loader from '@/app/components/loaders/loader';
import { generateArray } from '@/shared/scripts/constants';
import { createSwapy, utils, type SlotItemMap } from 'swapy';
import { State } from '@/app/components/container/container';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';

const identifierKey = `id`;
const initialUsers = generateArray(7, new User({ }), true, User);

export default function SwapyDemo() {
  const { loaded } = useContext<any>(State);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const swapyRef = useRef<ReturnType<typeof createSwapy> | null>(null);

  const [users, setUsers] = useState<User[]>(initialUsers);
  const [slotItemMap, setSlotItemMap] = useState<SlotItemMap | any>(utils.initSlotItemMap(users, identifierKey));

  const slottedItems = useMemo(() => utils.toSlottedItems(users, identifierKey, slotItemMap), [users, slotItemMap]);

  useEffect(() => {
    if (!containerRef.current) return;
    swapyRef.current = createSwapy(containerRef.current, { manualSwap: true });
    swapyRef.current.onSwap((event: any) => setSlotItemMap(event.newSlotItemMap.asArray));
    return () => swapyRef.current?.destroy();
  }, [])

  useEffect(() => {
    if (swapyRef.current) {
      utils.dynamicSwapy(swapyRef.current, users, identifierKey, slotItemMap, setSlotItemMap);
    }
    console.log(`Users`, users);
  }, [users])

  const removeDNDItem = (user: User) => {
    // setTimeout(() => {
      setUsers(users.filter(u => u[identifierKey] !== user[identifierKey]));
    // }, 100);
  }

  const newDNDItem = () => {
    setUsers(prevUsrs => {
      let number = prevUsrs.length + 1;
      let newUser = new User({
        number,
        name: `User ${number}`,
        [identifierKey]: `User_${number}`,
      });
      let updatedUsrs = [
        ...prevUsrs,
        new User({ 
          ...newUser, 
          [identifierKey]: newUser[identifierKey] + `_` + newUser?.uuid, 
        }),
      ];
      return updatedUsrs;
    })
  }

  return (
    <div className={`swapyDemoComponent`}>

      {!loaded ? (
        <Loader height={370} label={`Users Loading`} />
      ) : <>
        <div ref={containerRef} className={`users-container`}>
          {slottedItems.map(({ slotId, itemId, item: user }: any) => (
            <div key={slotId} className={`slot`} data-swapy-slot={slotId}>
              <div key={itemId} className={`user`} data-swapy-item={itemId}>
                <div className={`swapyDemoItemRow`}>
                  <span className={`usernameText`}>
                    {user?.name}
                  </span>
                  <Menu style={{ opacity: 0.55 }} />  
                </div>
                <button onClick={() => removeDNDItem(user)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <button className={`newSwapyItemButton w100`} onClick={newDNDItem}>
          Add User
        </button>
      </>}

    </div>
  )
}