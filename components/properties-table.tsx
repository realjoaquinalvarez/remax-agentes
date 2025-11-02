"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MapPin } from "lucide-react"
import { Property } from "@/lib/types/property"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const statusConfig = {
  vendido: {
    label: "Vendido",
    variant: "default" as const,
    className: "bg-red-500 hover:bg-red-600 text-white border-transparent",
  },
  alquilado: {
    label: "Alquilado",
    variant: "default" as const,
    className: "bg-orange-500 hover:bg-orange-600 text-white border-transparent",
  },
  activo: {
    label: "Activo",
    variant: "default" as const,
    className: "bg-green-500 hover:bg-green-600 text-white border-transparent",
  },
  pendiente: {
    label: "Pendiente",
    variant: "default" as const,
    className: "bg-blue-500 hover:bg-blue-600 text-white border-transparent",
  },
} as const

const typeLabels = {
  casa: "Casa",
  apartamento: "Apartamento",
  terreno: "Terreno",
  local: "Local",
}

export function PropertiesTable({ properties }: { properties: Property[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const columns: ColumnDef<Property>[] = [
    {
      accessorKey: "status",
      header: () => <div className="pl-4">Estado</div>,
      cell: ({ row }) => {
        const status = row.getValue("status") as Property["status"]
        const config = statusConfig[status]
        return (
          <div className="pl-4">
            <Badge variant={config.variant} className={config.className}>
              {config.label}
            </Badge>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      accessorKey: "type",
      header: () => <div>Tipo</div>,
      cell: ({ row }) => {
        const type = row.getValue("type") as Property["type"]
        return <div>{typeLabels[type]}</div>
      },
    },
    {
      accessorKey: "address",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Dirección
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const property = row.original
        return (
          <div>
            <div className="font-medium">{property.address}</div>
            <div className="text-xs text-muted-foreground">{property.city}</div>
          </div>
        )
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Precio
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const price = row.getValue("price") as number
        const formatted = `₲${price.toLocaleString()}`
        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "area",
      header: () => <div className="text-right pr-4">Área</div>,
      cell: ({ row }) => {
        const area = row.getValue("area") as number
        return <div className="text-right pr-4">{area} m²</div>
      },
    },
    {
      accessorKey: "bedrooms",
      header: () => <div className="text-center">Hab.</div>,
      cell: ({ row }) => {
        const bedrooms = row.getValue("bedrooms") as number
        return <div className="text-center">{bedrooms || "-"}</div>
      },
    },
    {
      accessorKey: "bathrooms",
      header: () => <div className="text-center">Baños</div>,
      cell: ({ row }) => {
        const bathrooms = row.getValue("bathrooms") as number
        return <div className="text-center">{bathrooms || "-"}</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-center pr-4">Mapa</div>,
      cell: ({ row }) => {
        const property = row.original
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${property.coordinates.lat},${property.coordinates.lng}`

        return (
          <div className="flex justify-center pr-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(mapsUrl, "_blank")}
              className="h-8 w-8 p-0"
            >
              <MapPin className="size-4" />
            </Button>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: properties,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <div className="w-full space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
        <Input
          placeholder="Buscar por dirección..."
          value={(table.getColumn("address")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("address")?.setFilterValue(event.target.value)
          }
          className="w-full sm:max-w-sm border-border/50 shadow-sm text-sm"
        />

        <Select
          value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
          onValueChange={(value) =>
            table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
          }
        >
          <SelectTrigger className="w-full sm:w-[180px] border-border/50 shadow-sm text-sm">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="activo">Activo</SelectItem>
            <SelectItem value="vendido">Vendido</SelectItem>
            <SelectItem value="alquilado">Alquilado</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
          </SelectContent>
        </Select>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto sm:ml-auto border-border/50 shadow-sm text-sm">
              Columnas <ChevronDown className="ml-2 size-4" />
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
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                )
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/50 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="text-xs sm:text-sm whitespace-nowrap">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-xs sm:text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-xs sm:text-sm"
                  >
                    No se encontraron propiedades.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
        <div className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
          Mostrando {table.getRowModel().rows.length} de {properties.length} propiedades
        </div>
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-border/50 shadow-sm text-xs sm:text-sm h-8"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-border/50 shadow-sm text-xs sm:text-sm h-8"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
