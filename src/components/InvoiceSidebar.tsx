import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Plus, Trash2, Users, User } from "lucide-react";

interface Client {
  id: string;
  name: string;
}

interface InvoiceSidebarProps {
  clients: Client[];
  selectedClient: string | null;
  onSelectClient: (id: string) => void;
  onAddClient: (name: string) => void;
  onDeleteClient: (id: string) => void;
}

export function InvoiceSidebar({
  clients,
  selectedClient,
  onSelectClient,
  onAddClient,
  onDeleteClient,
}: InvoiceSidebarProps) {
  const [newClientName, setNewClientName] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleAdd = () => {
    if (newClientName.trim()) {
      onAddClient(newClientName.trim());
      setNewClientName("");
      setShowAdd(false);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-sidebar-foreground">Фактуриране</h2>
              <p className="text-xs text-sidebar-foreground/60">Документи & клиенти</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <FileText className="h-4 w-4 text-primary-foreground" />
            </div>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
            {!collapsed && <><Users className="mr-2 h-3.5 w-3.5" />Клиенти</>}
            {collapsed && <Users className="h-3.5 w-3.5" />}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {clients.map((client) => (
                <SidebarMenuItem key={client.id}>
                  <SidebarMenuButton
                    onClick={() => onSelectClient(client.id)}
                    isActive={selectedClient === client.id}
                    className="group"
                  >
                    <User className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate">{client.name}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClient(client.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      </>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {!collapsed && (
                <SidebarMenuItem>
                  {showAdd ? (
                    <div className="px-2 py-1.5 space-y-2 animate-fade-in">
                      <Input
                        placeholder="Име на клиента"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                        className="h-8 text-sm bg-sidebar-accent border-sidebar-border text-sidebar-foreground"
                        autoFocus
                      />
                      <div className="flex gap-1.5">
                        <Button size="sm" className="h-7 flex-1 text-xs" onClick={handleAdd}>
                          Добави
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-sidebar-foreground"
                          onClick={() => setShowAdd(false)}
                        >
                          Откажи
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <SidebarMenuButton onClick={() => setShowAdd(true)}>
                      <Plus className="h-4 w-4" />
                      <span>Нов клиент</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
