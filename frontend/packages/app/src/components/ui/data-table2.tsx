'use client';

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tiko/core';
import { GripVerticalIcon } from 'lucide-react';
import { createContext, useContext, useMemo, type ReactNode } from 'react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  getRowId?: (row: TData) => string;
  onReorder?: (data: TData[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  getRowId,
  onReorder,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: getRowId ? (row) => getRowId(row) : undefined,
  });

  const rows = table.getRowModel().rows;
  const rowIds = useMemo(() => rows.map((row) => row.id), [rows]);

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!onReorder || !over || active.id === over.id) return;

    const oldIndex = rowIds.indexOf(String(active.id));
    const newIndex = rowIds.indexOf(String(over.id));
    onReorder(arrayMove(data, oldIndex, newIndex));
  }

  const body = (
    <TableBody>
      {rows.length ? (
        rows.map((row) => {
          const cells = row.getVisibleCells().map((cell) => (
            <TableCell
              key={cell.id}
              style={
                cell.column.columnDef.size !== undefined
                  ? { width: cell.column.getSize() }
                  : undefined
              }
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ));

          return onReorder ? (
            <SortableRow key={row.id} id={row.id}>
              {cells}
            </SortableRow>
          ) : (
            <TableRow key={row.id}>{cells}</TableRow>
          );
        })
      ) : (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            No results.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={
                    header.column.columnDef.size !== undefined
                      ? { width: header.getSize() }
                      : undefined
                  }
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        {onReorder ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={rowIds}
              strategy={verticalListSortingStrategy}
            >
              {body}
            </SortableContext>
          </DndContext>
        ) : (
          body
        )}
      </Table>
    </div>
  );
}

interface RowDragHandle {
  attributes: ReturnType<typeof useSortable>['attributes'];
  listeners: ReturnType<typeof useSortable>['listeners'];
}

const RowDragContext = createContext<RowDragHandle | null>(null);

export function useRowDragHandle() {
  return useContext(RowDragContext);
}

function SortableRow({ id, children }: { id: string; children: ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <RowDragContext.Provider value={{ attributes, listeners }}>
      <TableRow
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          opacity: isDragging ? 0.6 : undefined,
        }}
      >
        {children}
      </TableRow>
    </RowDragContext.Provider>
  );
}

export function DragHandle() {
  const drag = useRowDragHandle();

  return (
    <button
      type="button"
      className="text-muted-foreground hover:bg-muted flex size-7 cursor-grab items-center justify-center rounded-md active:cursor-grabbing"
      {...drag?.attributes}
      {...drag?.listeners}
    >
      <GripVerticalIcon className="size-4" />
    </button>
  );
}
