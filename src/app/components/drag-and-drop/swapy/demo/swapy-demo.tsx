'use client';

import './swapy-demo.scss';

import { Menu } from '@mui/icons-material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createSwapy, utils, type SlotItemMap } from 'swapy';

type User = {
  userId: string;
  name: string;
}

const initialUsers: User[] = [
  { userId: '1', name: 'Luffy' },
  { userId: '2', name: 'Zoro' },
  { userId: '3', name: 'Nami' },
  { userId: '4', name: 'Usopp' },
  { userId: '5', name: 'Sanji' },
  { userId: '6', name: 'Chopper' },
  { userId: '7', name: 'Robin' },
]

export default function SwapyDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const swapyRef = useRef<ReturnType<typeof createSwapy> | null>(null)

  const [users, setUsers] = useState<User[]>(initialUsers)
  const [slotItemMap, setSlotItemMap] = useState<SlotItemMap | any>(
    utils.initSlotItemMap(initialUsers, 'userId')
  )

  const slottedItems = useMemo(
    () => utils.toSlottedItems(users, 'userId', slotItemMap),
    [users, slotItemMap]
  )

  useEffect(() => {
    if (!containerRef.current) return

    swapyRef.current = createSwapy(containerRef.current, { manualSwap: true })

    swapyRef.current.onSwap((event: any) => {
      setSlotItemMap(event.newSlotItemMap.asArray)
    })

    return () => {
      swapyRef.current?.destroy()
    }
  }, [])

  useEffect(() => {
    if (swapyRef.current) {
        utils.dynamicSwapy(swapyRef.current, users, 'userId', slotItemMap, setSlotItemMap)
    }
  }, [users])

  return (
    <div className={`swapyDemoComponent`}>
      <div ref={containerRef} className="users-container">
        {slottedItems.map(({ slotId, itemId, item: user }: any) => (
          <div key={slotId} className="slot" data-swapy-slot={slotId}>
            <div className="user" key={itemId} data-swapy-item={itemId}>
              <div className={`swapyDemoItemRow`}>
                <span>{user?.name}</span>
                <Menu style={{ opacity: 0.55 }} />  
              </div>
              <button onClick={() => setUsers(users.filter(u => u.userId !== user.userId))}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() =>
          setUsers((prev) => [
            ...prev,
            { userId: crypto.randomUUID(), name: `User ${prev.length + 1}` },
          ])
        }
      >
        Add User
      </button>
    </div>
  )
}