import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface SiteHeaderProps {
  breadcrumb?: React.ReactNode
  actions?: React.ReactNode
}

export function SiteHeader({ breadcrumb, actions }: SiteHeaderProps) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b border-border transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center justify-between gap-2 px-3 sm:px-4 lg:px-6">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-1 sm:mx-2 h-3 sm:h-4 hidden xs:block"
          />
          <div className="min-w-0 flex-1">
            {breadcrumb}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  )
}
