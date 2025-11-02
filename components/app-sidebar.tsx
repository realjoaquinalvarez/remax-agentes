"use client"

import * as React from "react"
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconPlugConnected,
  IconSettings,
  IconUsers,
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
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navAdmin: [
    {
      title: "Panel de Administrador",
      url: "/admin-panel",
      icon: IconDashboard,
    },
  ],
  navMain: [
    {
      title: "Panel General",
      url: "/panel-general",
      icon: IconDashboard,
    },
    {
      title: "Agentes",
      url: "/admin-panel/agentes",
      icon: IconUsers,
    },
    {
      title: "Conexiones",
      url: "/admin-panel/conexiones",
      icon: IconPlugConnected,
    },
    {
      title: "Propiedades",
      url: "#",
      icon: IconFolder,
    },
    {
      title: "Análisis",
      url: "#",
      icon: IconChartBar,
    },
  ],
  navSecondary: [
    {
      title: "Configuración",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Ayuda",
      url: "#",
      icon: IconHelp,
    },
  ],
}

export function   AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="h-auto px-3 py-3">
        <a href="/admin-panel" className="flex items-center ml-1">
          <img src="/REMAX_logo.svg.png" alt="Remax Logo" className="h-12 w-auto object-contain" />
        </a>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navAdmin} />
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
