"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { LuChevronDown } from "react-icons/lu";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { toCssVarName } from "@/lib/utils/string.utils";

interface DynamicDataTableProps {
  data: Record<string, unknown>[];
  tableHeight?: number;
  withFilter?: boolean;
  withColumns?: boolean;
  totalCount?: number;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

export function DynamicDataTable({
  data,
  tableHeight,
  withFilter = true,
  withColumns = true,
  totalCount = 0,
  onLoadMore,
  isLoading = false,
}: DynamicDataTableProps) {
  const [tableDivHeight, setTableDivHeight] = useState(tableHeight);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const tableRef = useRef<HTMLTableElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tableRef.current && tableHeight) {
      setTableDivHeight(data?.length >= 10 ? tableHeight : tableRef.current.clientHeight);
    }
  }, [tableRef.current, data?.length]);

  const columns: ColumnDef<Record<string, unknown>>[] = useMemo(() => {
    if (data.length === 0) return [];

    return Object.keys(data[0]).map((key) => ({
      accessorKey: key,
      header: key,
      cell: ({ row }) => <div>{row.getValue(key)?.toString()}</div>,
    }));
  }, [data]);

  console.log("columns", columns);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    columnResizeMode: "onChange",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    defaultColumn: {
      minSize: 50,
      maxSize: 500,
    },
  });

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 36,
    getScrollElement: () => tableContainerRef.current,
    overscan: 5,
  });

  const fetchMoreOnBottomReached = useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement && onLoadMore) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        if (scrollHeight - scrollTop - clientHeight < 500 && !isLoading && data.length < totalCount) {
          onLoadMore();
        }
      }
    },
    [onLoadMore, isLoading, data.length, totalCount]
  );

  useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  const columnSizeVars = useMemo(() => {
    const headers = table.getFlatHeaders();
    const colSizes: { [key: string]: number } = {};
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]!;
      colSizes[`--header-${toCssVarName(header.id)}-size`] = header.getSize();
      colSizes[`--col-${toCssVarName(header.column.id)}-size`] = header.column.getSize();
    }
    return colSizes;
  }, [table.getState().columnSizingInfo, table.getState().columnSizing, data]);

  return (
    <div className="size-full">
      {withFilter ||
        (withColumns && (
          <div className="flex items-center overflow-hidden">
            {withFilter && (
              <Input
                placeholder="Filter..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                className="max-w-sm"
              />
            )}
            {withColumns && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                    Columns <LuChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize cursor-pointer"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}

      <div
        ref={tableContainerRef}
        className="overflow-auto"
        style={{ height: tableDivHeight ? `${tableDivHeight}px` : "600px" }}
        onScroll={(e) => fetchMoreOnBottomReached(e.target as HTMLDivElement)}
      >
        <Table
          ref={tableRef}
          style={{ ...columnSizeVars, width: table.getTotalSize() }}
          className="border-spacing-0 border-separate text-2sm"
        >
          <TableHeader className="sticky top-0 z-10 bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="font-semibold h-8 relative overflow-hidden z-10 border border-l-0 first:border-l"
                      style={{
                        width: `calc(var(--header-${toCssVarName(header.id)}-size) * 1px)`,
                        minWidth: `calc(var(--header-${toCssVarName(header.id)}-size) * 1px)`,
                        maxWidth: `calc(var(--header-${toCssVarName(header.id)}-size) * 1px)`,
                      }}
                    >
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      <div
                        onDoubleClick={() => header.column.resetSize()}
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`absolute top-0 h-full right-0 w-[5px] bg-black/50 cursor-col-resize select-none touch-none hover:opacity-100 group-hover:opacity-100 ${
                          header.column.getIsResizing() ? "bg-blue-500 opacity-100" : "opacity-0"
                        }`}
                      />
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const row = rows[virtualRow.index];
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b-0"
                  style={{
                    position: "absolute",
                    transform: `translateY(${virtualRow.start}px)`,
                    width: "100%",
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className="border-b border-t-0 border-r first:border-l text-nowrap overflow-hidden"
                      key={cell.id}
                      style={{
                        width: `calc(var(--col-${toCssVarName(cell.column.id)}-size) * 1px)`,
                        minWidth: `calc(var(--col-${toCssVarName(cell.column.id)}-size) * 1px)`,
                        maxWidth: `calc(var(--col-${toCssVarName(cell.column.id)}-size) * 1px)`,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <div>Loading more...</div>
        </div>
      )}
    </div>
  );
}
