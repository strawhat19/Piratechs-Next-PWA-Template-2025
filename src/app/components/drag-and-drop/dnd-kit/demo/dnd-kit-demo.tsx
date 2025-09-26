'use client';

import { CSS } from '@dnd-kit/utilities';
import { Types } from '@/shared/types/types';
import { constants, genID } from '@/shared/scripts/constants';
import { useContext, useMemo, useState } from 'react';
import { State } from '@/app/components/container/container';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DndContext, DragEndEvent, MouseSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

// OPTIONAL: if you want to constrain dragging vertically, uncomment this line and add to DndContext `modifiers`
// import { restrictToVerticalAxis } from '@dnd-kit/modifiers';

type Item = { id: string; title: string };

// ---- Sortable Row (headless, minimal styles) ----
function SortableRow({
  id,
  children,
  onClick,
  onDelete,
}: {
  id: string;
  children: React.ReactNode;
  onClick: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    background: 'var(--card, #141414)',
    border: '1px solid var(--outline, #2a2a2a)',
    borderRadius: 12,
    padding: '10px 12px',
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    cursor: 'grab',
    userSelect: 'none',
  };

  return (
    <div ref={setNodeRef} className={`draggableItem`} style={style} {...attributes} {...listeners}>
        <div style={{ flex: 1, display: `flex`, alignItems: `center`, justifyContent: `space-between`, gap: 10 }} onClick={onClick}>
            <div
                aria-hidden
                title="Drag"
                style={{
                    width: 16, height: 16, borderRadius: 4, border: '1px solid #555',
                    display: 'grid', placeItems: 'center', fontSize: 10, flex: '0 0 auto'
                }}
            >
                ⇅
            </div>
            <div style={{ flex: 1 }}>
                {children}
            </div>
        </div>
        <button
            onClick={onDelete}
            aria-label="Delete"
            style={{
                border: '1px solid #444', background: 'transparent', color: 'inherit',
                padding: '6px 10px', borderRadius: 8, cursor: 'pointer'
            }}
        >
            ✕
        </button>
    </div>
  );
}

// ---- Demo Component ----
export default function DndKitSimpleDemo() {
  let { width, isPWA, setSelected } = useContext<any>(State);

  const [items, setItems] = useState<Item[]>(() => [
    { id: genID(Types.Data, 1, `First Task`)?.id, title: `First Task` },
    { id: genID(Types.Data, 2, `Second Task`)?.id, title: `Second Task` },
    { id: genID(Types.Data, 3, `Third Task`)?.id, title: `Third Task` },
  ]);

  const [newTitle, setNewTitle] = useState('');

  // sensors: drag starts after slight pointer movement for better clickability
  const desktopSensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const mobileSensors = useSensors(
        // useSensor(MouseSensor),
        useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 5 } })
    );
  const sensors = (isPWA || width <= constants?.breakpoints?.mobile) ? mobileSensors : desktopSensors;

  // <Img alt={img[0]} src={img[1]} width={`auto`} height={(isPWA || width <= constants?.breakpoints?.mobile) ? `300px` : `650px`} />

  // add item (ephemeral)
  const addItem = () => {
    // const title = newTitle.trim();
    // if (!title) return;
    setItems((prev: any) => {
        let newIndex = prev.length + 1;
        let newTitle = `Task ${newIndex}`;
        let newID = genID(Types.Data, newIndex, newTitle);
        let updatedItems = [...prev, { id: newID?.id, title: newTitle }];
        return updatedItems;
    });
    setNewTitle(``);
  };

  // delete item
  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // drag-end reorder
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setItems(prev => {
      const oldIndex = prev.findIndex(i => i.id === active.id);
      const newIndex = prev.findIndex(i => i.id === over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  // simple box styles
  const box: React.CSSProperties = useMemo(() => ({
    maxWidth: `100%`,
    margin: '30px auto',
    padding: 16,
    borderRadius: 14,
    border: '1px solid #2a2a2a',
    background: 'var(--surface, #0f0f0f)',
    color: '#eaeaea',
    overflowY: `auto`,
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif',
    maxHeight: width <= constants?.breakpoints?.mobile ? (isPWA ? 400 : 300) : 800,
  }), []);

  return (
    <div className={`dndContainer componentContainer`} style={box}>
      {/* <h2 style={{ marginTop: 0, marginBottom: 12 }}>
        dnd-kit demo
      </h2> */}

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {/* <input
          value={newTitle}
          onChange={e => setNewTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
          placeholder="Add a new item..."
          style={{
            flex: 1, padding: '10px 12px', borderRadius: 10, outline: 'none',
            border: '1px solid #333', background: '#121212', color: 'inherit'
          }}
        /> */}
        <button
          onClick={addItem}
          style={{
            width: `100%`,
            padding: '10px 14px', borderRadius: 10, border: '1px solid #444',
            background: 'linear-gradient(180deg,#1f1f1f,#171717)', color: 'inherit', cursor: 'pointer'
          }}
        >
          Add
        </button>
      </div>

      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        {/* Add restrictToVerticalAxis in modifiers=[] if you imported it */}
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className={`itemsGrid`} style={{ display: 'grid', gap: 8 }}>
            {items.map(item => (
              <SortableRow key={item.id} id={item.id} onClick={() => setSelected(item)} onDelete={() => deleteItem(item.id)}>
                {item.title}
              </SortableRow>
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* <div style={{ marginTop: 14, opacity: 0.7, fontSize: 12 }}>
        Refresh to reset. (State is in-memory only.)
      </div> */}
    </div>
  );
}