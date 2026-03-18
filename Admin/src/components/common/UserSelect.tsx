import * as React from "react"
import { Check, ChevronsUpDown, Loader2, UserCircle } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import api from "@/lib/api"
import type { ApiResponse, Page, User } from "@/types/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserSelectProps {
  value: string
  onSelect: (value: string) => void
  placeholder?: string
  className?: string
}

export function UserSelect({ value, onSelect, placeholder = "Chọn người dùng...", className }: UserSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [users, setUsers] = React.useState<User[]>([])
  const [loading, setLoading] = React.useState(false)

  const fetchUsers = React.useCallback(async () => {
    setLoading(true)
    try {
      const response = await api.get<ApiResponse<Page<User>>>('/users', {
        params: { size: 100, page: 0 }
      })
      setUsers(response.data.data.content)
    } catch (error) {
      console.error("Failed to fetch users", error)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (open && users.length === 0) {
      fetchUsers()
    }
  }, [open, users.length, fetchUsers])

  const selectedUser = users.find((user) => user.id.toString() === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between h-11 px-3 rounded-xl bg-muted/30 border-border/50 font-medium hover:bg-muted/50 transition-colors", className)}
        >
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            {selectedUser ? (
               <>
                  <Avatar className="h-6 w-6 border border-border/50 shrink-0">
                      <AvatarImage src={selectedUser.avatarUrl} />
                      <AvatarFallback className="text-[8px] font-black">
                          {selectedUser.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                  </Avatar>
                  <span className="truncate text-foreground font-bold">{selectedUser.fullName || selectedUser.username} <span className="text-[10px] text-muted-foreground ml-1">(@{selectedUser.username})</span></span>
               </>
            ) : (
              <>
                  <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground">{placeholder}</span>
              </>
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command className="rounded-xl border shadow-2xl">
          <CommandInput placeholder="Tìm tên hoặc username..." className="h-11" />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>
                {loading ? (
                    <div className="flex items-center justify-center p-6 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span className="text-sm font-bold">Đang tải danh sách...</span>
                    </div>
                ) : (
                    <div className="p-6 text-center text-muted-foreground font-medium">
                        Không tìm thấy người dùng nào.
                    </div>
                )}
            </CommandEmpty>
            <CommandGroup className="p-1.5">
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={user.username + " " + (user.fullName || "")}
                  onSelect={() => {
                    onSelect(user.id.toString())
                    setOpen(false)
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer data-[selected=true]:bg-primary/10 data-[selected=true]:text-primary"
                >
                  <Avatar className="h-9 w-9 border border-border/50 shrink-0">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback className="text-[10px] font-black">
                        {user.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-sm font-black truncate">{user.fullName || user.username}</span>
                    <span className="text-[10px] uppercase font-black opacity-60">@{user.username}</span>
                  </div>
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 shrink-0",
                      value === user.id.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
