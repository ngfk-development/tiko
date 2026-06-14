'use client';

import { Link, useNavigate } from '@tanstack/react-router';
import type {
  ColumnDef,
  RowData,
  Table as TableType,
} from '@tanstack/react-table';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Field,
  FieldLabel,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useDelayedLoading,
} from '@tiko/core';

const DEFAULT_SKELETON_ROW_COUNT = 3;
const ROW_HEIGHT_CLASS = 'h-[49px]';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    width?: string;
  }
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
  noResultsLabel: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  perPage: number;
  total: number;
  rowsPerPageLabel: string;
}

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const showSkeleton = useDelayedLoading(!!props.loading);

  const table = useReactTable({
    data: props.data,
    columns: props.columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    rowCount: props.pagination?.total,
    state: {
      pagination: props.pagination
        ? {
            pageIndex: props.pagination.page,
            pageSize: props.pagination.perPage,
          }
        : undefined,
    },
  });

  const skeletonRowCount = props.pagination
    ? Math.max(
        1,
        Math.min(
          props.pagination.perPage,
          props.pagination.total -
            props.pagination.page * props.pagination.perPage,
        ),
      )
    : DEFAULT_SKELETON_ROW_COUNT;

  const content = (
    <DataTableContent
      table={table}
      noResultsLabel={props.noResultsLabel}
      loading={showSkeleton}
      skeletonRowCount={skeletonRowCount}
    />
  );

  if (!props.pagination) return content;
  return (
    <div>
      {content}
      <DataTablePagination pagination={props.pagination} />
    </div>
  );
}

interface DataTableChildProps<TData> {
  table: TableType<TData>;
  noResultsLabel: string;
  loading?: boolean;
  skeletonRowCount: number;
}

function DataTableContent<TData>({
  table,
  noResultsLabel,
  loading,
  skeletonRowCount,
}: DataTableChildProps<TData>) {
  const columnCount = table.getAllColumns().length;

  return (
    <div className="overflow-hidden rounded-md border">
      <Table className="table-fixed">
        <colgroup>
          {table.getVisibleLeafColumns().map((column) => (
            <col
              key={column.id}
              style={{ width: column.columnDef.meta?.width }}
            />
          ))}
        </colgroup>

        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {loading ? (
            Array.from({ length: skeletonRowCount }, (_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columnCount }, (_, cellIndex) => (
                  <TableCell key={cellIndex} className={ROW_HEIGHT_CLASS}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && 'selected'}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={ROW_HEIGHT_CLASS}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columnCount} className="h-24 text-center">
                {noResultsLabel}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

interface DataTablePaginationProps {
  pagination: Pagination;
}

function DataTablePagination(props: DataTablePaginationProps) {
  const navigate = useNavigate();

  const canPreviousPage = props.pagination.page > 0;
  const canNextPage =
    (props.pagination.page + 1) * props.pagination.perPage <
    props.pagination.total;

  return (
    <div className="mt-4 flex items-center justify-end gap-4">
      <Field orientation="horizontal" className="w-fit">
        <FieldLabel htmlFor="select-rows-per-page">
          {props.pagination.rowsPerPageLabel}
        </FieldLabel>
        <Select
          value={props.pagination.perPage}
          onValueChange={(perPage) =>
            navigate({
              to: '.',
              search: (prev: Pagination) => ({
                ...prev,
                perPage,
                page: 0,
              }),
              resetScroll: false,
            } as never)
          }
        >
          <SelectTrigger className="w-20" id="select-rows-per-page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="start">
            <SelectGroup>
              <SelectItem value={10}>10</SelectItem>
              <SelectItem value={25}>25</SelectItem>
              <SelectItem value={50}>50</SelectItem>
              <SelectItem value={100}>100</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>

      <Pagination className="mx-0 w-auto">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              render={
                <Link
                  to="."
                  search={
                    ((prev: Pagination) => ({
                      ...prev,
                      page: props.pagination.page - 1,
                    })) as never
                  }
                  resetScroll={false}
                />
              }
              disabled={!canPreviousPage}
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              render={
                <Link
                  to="."
                  search={
                    ((prev: Pagination) => ({
                      ...prev,
                      page: props.pagination.page + 1,
                    })) as never
                  }
                  resetScroll={false}
                />
              }
              disabled={!canNextPage}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
