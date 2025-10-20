"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconHelp,
  IconInnerShadowTop,
  IconPlugConnected,
  IconSettings,
  IconUsers,
  IconBuildingEstate,
  IconFileText,
  IconCalendarEvent,
  IconMessages,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Agente RE/MAX",
    email: "agente@remax.com",
    avatar: "/avatars/agent.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Agentes",
      url: "/dashboard/agentes",
      icon: IconUsers,
    },
    {
      title: "Conexiones",
      url: "/dashboard/conexiones",
      icon: IconPlugConnected,
    },
    {
      title: "Propiedades",
      url: "/dashboard/propiedades",
      icon: IconBuildingEstate,
    },
    {
      title: "Análisis",
      url: "/dashboard/analisis",
      icon: IconChartBar,
    },
  ],
  navTools: [
    {
      title: "Calendario",
      url: "/dashboard/calendario",
      icon: IconCalendarEvent,
    },
    {
      title: "Mensajes",
      url: "/dashboard/mensajes",
      icon: IconMessages,
    },
    {
      title: "Documentos",
      url: "/dashboard/documentos",
      icon: IconFileText,
    },
  ],
  navSecondary: [
    {
      title: "Configuración",
      url: "/dashboard/configuracion",
      icon: IconSettings,
    },
    {
      title: "Ayuda",
      url: "/dashboard/ayuda",
      icon: IconHelp,
    },
  ],
}

export function   AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">RE/MAX Agentes</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <SidebarSeparator />
        <NavSecondary items={data.navTools} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
