"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
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
import { ArrowUpDown, User, TrendingUp, TrendingDown } from "lucide-react"
import { Agent } from "@/lib/types/agent"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface AgentsTableProps {
  agents: Agent[]
  type: "sales" | "social"
}

export function AgentsTable({ agents, type }: AgentsTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: type === "sales" ? "leads" : "followers", desc: true }
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [timeFilter, setTimeFilter] = React.useState<"dia" | "semana" | "mes" | "año">("mes")

  // Get time-filtered metrics
  const getFilteredMetrics = (monthlyValue: number) => {
    const multipliers = {
      dia: 0.033,
      semana: 0.25,
      mes: 1,
      año: 12,
    }
    return Math.floor(monthlyValue * multipliers[timeFilter])
  }

  // Sales columns
  const salesColumns: ColumnDef<Agent>[] = [
    {
      id: "rank",
      header: () => <div className="pl-4 w-16">#</div>,
      cell: ({ row }) => {
        const sortedAgents = [...agents]
          .map(a => ({
            ...a,
            filteredLeads: getFilteredMetrics(a.monthlyMetrics.leads || 0)
          }))
          .sort((a, b) => b.filteredLeads - a.filteredLeads)
        const rank = sortedAgents.findIndex(a => a.id === row.original.id) + 1
        return (
          <div className="pl-4 w-16">
            <div className="inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {rank}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Agente
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const agent = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <User className="size-4 text-primary" />
            </div>
            <div>
              <div className="font-medium">{agent.name}</div>
              <div className="text-xs text-muted-foreground">{agent.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "leads",
      accessorFn: (row) => getFilteredMetrics(row.monthlyMetrics.leads || 0),
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Clientes Cerrados
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const leads = getFilteredMetrics(row.original.monthlyMetrics.leads || 0)
        return <div className="text-base font-medium">{leads}</div>
      },
    },
    {
      accessorKey: "properties",
      accessorFn: (row) => row.totalProperties,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Propiedades
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div className="font-medium">{row.original.totalProperties}</div>
      },
    },
    {
      accessorKey: "revenue",
      accessorFn: (row) => getFilteredMetrics(row.monthlyMetrics.leads || 0) * 250000,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Ingresos Est.
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const revenue = getFilteredMetrics(row.original.monthlyMetrics.leads || 0) * 250000
        return <div className="font-medium">₲{revenue.toLocaleString()}</div>
      },
    },
    {
      id: "status",
      header: () => <div>Estado</div>,
      cell: ({ row }) => {
        const agent = row.original
        return (
          <div>
            <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white border-transparent">
              {agent.status === "active" ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="pr-4">Acción</div>,
      cell: ({ row }) => {
        const agent = row.original
        return (
          <div className="pr-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/admin-panel/agentes/${agent.id}`)
              }}
              className="h-8 text-xs hover:bg-primary/10 hover:text-primary"
            >
              Ver Detalle
            </Button>
          </div>
        )
      },
    },
  ]

  // Social media columns
  const socialColumns: ColumnDef<Agent>[] = [
    {
      id: "rank",
      header: () => <div className="pl-4 w-16">#</div>,
      cell: ({ row }) => {
        const sortedAgents = [...agents]
          .map(a => ({
            ...a,
            filteredFollowers: getFilteredMetrics(a.monthlyMetrics.followers)
          }))
          .sort((a, b) => b.filteredFollowers - a.filteredFollowers)
        const rank = sortedAgents.findIndex(a => a.id === row.original.id) + 1
        return (
          <div className="pl-4 w-16">
            <div className="inline-flex size-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {rank}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Agente
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const agent = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <User className="size-4 text-primary" />
            </div>
            <div>
              <div className="font-medium">{agent.name}</div>
              <div className="text-xs text-muted-foreground">{agent.email}</div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "followers",
      accessorFn: (row) => getFilteredMetrics(row.monthlyMetrics.followers),
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Seguidores
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const followers = getFilteredMetrics(row.original.monthlyMetrics.followers)
        return <div className="text-base font-medium">{followers.toLocaleString()}</div>
      },
    },
    {
      accessorKey: "growth",
      accessorFn: (row) => row.monthlyMetrics.followerGrowth,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Crecimiento
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const growth = row.original.monthlyMetrics.followerGrowth
        const isPositive = growth > 0
        return (
          <div className={`flex items-center gap-1.5 font-medium ${isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
            {isPositive ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
            <span>{growth}%</span>
          </div>
        )
      },
    },
    {
      accessorKey: "posts",
      accessorFn: (row) => getFilteredMetrics(row.monthlyMetrics.posts),
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Posts
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div className="font-medium">{getFilteredMetrics(row.original.monthlyMetrics.posts)}</div>
      },
    },
    {
      accessorKey: "reach",
      accessorFn: (row) => getFilteredMetrics(row.monthlyMetrics.reach),
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Alcance
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div className="font-medium">{getFilteredMetrics(row.original.monthlyMetrics.reach).toLocaleString()}</div>
      },
    },
    {
      accessorKey: "engagement",
      accessorFn: (row) => row.monthlyMetrics.engagementRate,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Engagement
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div className="font-medium">{row.original.monthlyMetrics.engagementRate}%</div>
      },
    },
    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="pr-4">Acción</div>,
      cell: ({ row }) => {
        const agent = row.original
        return (
          <div className="pr-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/admin-panel/agentes/${agent.id}`)
              }}
              className="h-8 text-xs hover:bg-primary/10 hover:text-primary"
            >
              Ver Detalle
            </Button>
          </div>
        )
      },
    },
  ]

  const columns = type === "sales" ? salesColumns : socialColumns

  const table = useReactTable({
    data: agents,
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
        pageSize: 10,
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
    <div className="w-full space-y-4">
      <div className="flex items-center gap-4">
        <Input
          placeholder="Buscar por nombre..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm border-border/50 shadow-sm"
        />

        <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as "dia" | "semana" | "mes" | "año")}>
          <SelectTrigger className="ml-auto w-[140px] h-9 border-border/50 shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dia">Día</SelectItem>
            <SelectItem value="semana">Semana</SelectItem>
            <SelectItem value="mes">Mes</SelectItem>
            <SelectItem value="año">Año</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border/50 shadow-sm">
        <Table>
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
                    <TableCell key={cell.id}>
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
                  className="h-24 text-center"
                >
                  No se encontraron agentes.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {table.getRowModel().rows.length} de {agents.length} agentes
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="border-border/50 shadow-sm"
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="border-border/50 shadow-sm"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
