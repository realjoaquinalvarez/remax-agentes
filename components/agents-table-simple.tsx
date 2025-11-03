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
} from "@tanstack/react-table"
import { ArrowUpDown, User, Facebook, Instagram } from "lucide-react"
import { Agent } from "@/hooks/use-agents"
import { Button } from "@/components/ui/button"
import { SyncStatusIndicator } from "@/components/data-freshness-badge"
import { Badge } from "@/components/ui/badge"
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
}

export function AgentsTableSimple({ agents }: AgentsTableProps) {
  const router = useRouter()
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "followers", desc: true }
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const columns: ColumnDef<Agent>[] = [
    {
      id: "rank",
      header: () => <div className="pl-4 w-16">#</div>,
      cell: ({ row }) => {
        const sortedAgents = [...agents]
          .sort((a, b) => {
            const aFollowers = (a.latestMetrics?.followers || 0)
            const bFollowers = (b.latestMetrics?.followers || 0)
            return bFollowers - aFollowers
          })
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
      id: "platforms",
      header: () => <div>Plataformas</div>,
      cell: ({ row }) => {
        const agent = row.original
        return (
          <div className="flex gap-2">
            {agent.facebook_page_id && (
              <Badge variant="outline" className="gap-1">
                <Facebook className="size-3" />
                {agent.facebook_page_name || 'Facebook'}
              </Badge>
            )}
            {agent.instagram_account_id && (
              <Badge variant="outline" className="gap-1">
                <Instagram className="size-3" />
                {agent.instagram_username || 'Instagram'}
              </Badge>
            )}
            {!agent.facebook_page_id && !agent.instagram_account_id && (
              <span className="text-xs text-muted-foreground">Sin conectar</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "followers",
      accessorFn: (row) => row.latestMetrics?.followers || 0,
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
        const followers = row.original.latestMetrics?.followers || 0
        return <div className="text-base font-medium">{followers.toLocaleString()}</div>
      },
    },
    {
      accessorKey: "posts",
      accessorFn: (row) => row.latestMetrics?.posts_count || 0,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Publicaciones
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const posts = row.original.latestMetrics?.posts_count || 0
        return <div className="text-base font-medium">{posts}</div>
      },
    },
    {
      accessorKey: "impressions",
      accessorFn: (row) => row.latestMetrics?.impressions || 0,
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-8 px-2 -ml-2"
          >
            Impresiones
            <ArrowUpDown className="ml-2 size-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const impressions = row.original.latestMetrics?.impressions || 0
        return <div className="text-base font-medium">{impressions.toLocaleString()}</div>
      },
    },
    {
      accessorKey: "engagement",
      accessorFn: (row) => row.latestMetrics?.total_engagements || 0,
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
        const engagement = row.original.latestMetrics?.total_engagements || 0
        return <div className="text-base font-medium">{engagement.toLocaleString()}</div>
      },
    },
    {
      id: "sync_status",
      header: () => <div>Estado de Datos</div>,
      cell: ({ row }) => {
        const agent = row.original
        return (
          <SyncStatusIndicator
            lastSyncDate={agent.last_successful_sync}
            syncStatus={
              agent.consecutive_sync_failures > 0 ? 'failed' : 'success'
            }
          />
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

  const table = useReactTable({
    data: agents,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Buscar agentes..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

      {/* Table */}
      <div className="rounded-md border">
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
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/admin-panel/agentes/${row.original.id}`)}
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
                  No se encontraron resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} agente(s) encontrado(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  )
}
