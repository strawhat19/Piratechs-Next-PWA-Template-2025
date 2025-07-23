'use client';

import './react-beautiful-dnd-demo.scss';

import React, { useState } from 'react';
import { Close } from '@mui/icons-material';
import { Button, Tooltip } from '@mui/material';
import { User } from '@/shared/types/models/User';
import { generateArray } from '@/shared/scripts/constants';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const initialUsers = generateArray(8, new User({}), true, User);

export default function ReactBeautifulDNDDemo() {
  const [users, setUsers] = useState<User[]>(initialUsers);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(users);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setUsers(reordered);
  };

  const newDNDItem = () => {
      setUsers(prevUsrs => {
        let number = prevUsrs.length + 1;
        let newUser = new User({
          number,
          id: `User_${number}`,
          name: `User ${number}`,
        });
        let updatedUsrs = [
          ...prevUsrs,
          new User({ 
            ...newUser, 
            id: newUser.id + `_` + newUser?.uuid, 
          }),
        ];
        return updatedUsrs;
      })
  }
  
  const removeDNDItem = (usr: User) => {
    setUsers(prevUsrs => {
        let updatedUsrs = prevUsrs?.filter(u => u?.id != usr?.id);
        return updatedUsrs;
    })
  }

  return (
    <div className={`reactBeautifulDNDDemoComponent w75`} style={{ overflowX: `hidden`, overflowY: `auto`, maxHeight: `calc(100vh - 100px)` }}>
      <DragDropContext onDragEnd={handleDragEnd}>

        <Droppable droppableId={`users`} isDropDisabled={false} isCombineEnabled={false} ignoreContainerClipping={false}>
          {(provided) => (

            <div ref={provided.innerRef} {...provided.droppableProps} className={`droppableItems`} style={{ display: `grid`, gap: 12, gridTemplateColumns: `repeat(8, 1fr)` }}>
              {users.map((user: User, index: number) => (

                <Draggable key={user.id} draggableId={user.id} index={index} isDragDisabled={false}>
                  {(provided) => (
                    <div
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      ref={provided.innerRef}
                      className={`draggableItem`}
                      style={{
                        border: 0,
                        padding: 12,
                        borderRadius: 4,
                        background: `var(--bg)`,
                        ...provided.draggableProps.style,
                      }}
                    >
                        <strong className={`textAlignCenter`}>
                            {user.name}
                        </strong>
                        <Tooltip title={`Delete`} arrow>
                            <Close onClick={() => removeDNDItem(user)} className={`cursorPointer`} />
                        </Tooltip>
                    </div>
                  )}
                </Draggable>

              ))}
              {provided.placeholder}
            </div>

          )}
        </Droppable>

      </DragDropContext>

      <Button className={`newDndItemButton w100 font`} onClick={newDNDItem} style={{ marginTop: 15, opacity: users.length >= 8 ? 0.25 : 1 }} disabled={users.length >= 8}>
        Add User
      </Button>
    </div>
  );
}