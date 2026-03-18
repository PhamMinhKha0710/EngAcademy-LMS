import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import type { ControllerRenderProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { User } from '@/types/api'

const formSchema = z.object({
    username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
    fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
    email: z.string().email('Email không hợp lệ'),
    password: z.string().optional(),
    isActive: z.boolean(),
    classId: z.number().nullable().optional(),
})

type FormValues = {
    username: string;
    fullName: string;
    email: string;
    password?: string;
    isActive: boolean;
    classId?: number | null;
}

interface UserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user?: User | null
    onSuccess: () => void
    role: 'ROLE_TEACHER' | 'ROLE_STUDENT'
}

export function UserDialog({ open, onOpenChange, user, onSuccess, role }: UserDialogProps) {
    const [submitting, setSubmitting] = useState(false)
    const [classes, setClasses] = useState<{ id: number; name: string }[]>([])
    const isEdit = !!user

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            fullName: '',
            email: '',
            password: '',
            isActive: true,
            classId: null,
        },
    })

    useEffect(() => {
        if (open) {
            if (user) {
                form.reset({
                    username: user.username,
                    fullName: user.fullName || '',
                    email: user.email || '',
                    password: '',
                    isActive: user.isActive !== false,
                    classId: user.classId || null,
                })
            } else {
                form.reset({
                    username: '',
                    fullName: '',
                    email: '',
                    password: '',
                    isActive: true,
                    classId: null,
                })
            }
        }
    }, [open, user, form])

    useEffect(() => {
        const fetchClasses = async () => {
            if (open && role === 'ROLE_STUDENT') {
                try {
                    const response = await api.get('/classes')
                    setClasses(response.data.data || [])
                } catch (error) {
                    console.error('Failed to fetch classes:', error)
                }
            }
        }
        fetchClasses()
    }, [open, role])

    const onSubmit = async (values: FormValues) => {
        setSubmitting(true)
        try {
            if (isEdit) {
                const updateData = {
                    fullName: values.fullName,
                    email: values.email,
                    roles: [role],
                    isActive: values.isActive,
                    classId: values.classId,
                }
                await api.put(`/users/${user.id}`, updateData)
                toast.success('Cập nhật người dùng thành công')
            } else {
                if (!values.password) {
                    toast.error('Vui lòng nhập mật khẩu cho người dùng mới')
                    setSubmitting(false)
                    return
                }
                const createData = {
                    username: values.username,
                    password: values.password,
                    fullName: values.fullName,
                    email: values.email,
                    roles: [role],
                    classId: values.classId,
                }
                await api.post('/users', createData)
                toast.success('Tạo người dùng thành công')
            }
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error('Failed to save user:', error)
            const err = error as { response?: { data?: { message?: string } } }
            const message = err.response?.data?.message || 'Có lỗi xảy ra'
            toast.error(message)
        } finally {
            setSubmitting(false)
        }
    }

    const title = role === 'ROLE_TEACHER' ? 'giáo viên' : 'học sinh'

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl p-8 border-none shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">
                        {isEdit ? `CHỈNH SỬA ${title.toUpperCase()}` : `THÊM ${title.toUpperCase()} MỚI`}
                    </DialogTitle>
                    <DialogDescription className="font-medium text-muted-foreground">
                        {isEdit ? 'Cập nhật thông tin tài khoản người dùng.' : 'Điền thông tin để tạo tài khoản mới.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }: { field: ControllerRenderProps<FormValues, 'username'> }) => (
                                <FormItem>
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Tên đăng nhập</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="username" 
                                            {...field} 
                                            disabled={isEdit}
                                            className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-bold" 
                                        />
                                    </FormControl>
                                    <FormMessage className="text-[10px] uppercase font-bold" />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }: { field: ControllerRenderProps<FormValues, 'fullName'> }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Họ và tên</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Nguyễn Văn A" 
                                                {...field} 
                                                className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-bold" 
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] uppercase font-bold" />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }: { field: ControllerRenderProps<FormValues, 'email'> }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Email</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="example@gmail.com" 
                                                {...field} 
                                                className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-bold" 
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] uppercase font-bold" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {!isEdit && (
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }: { field: ControllerRenderProps<FormValues, 'password'> }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Mật khẩu</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="password" 
                                                placeholder="••••••••" 
                                                {...field} 
                                                className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-bold" 
                                            />
                                        </FormControl>
                                        <FormMessage className="text-[10px] uppercase font-bold" />
                                    </FormItem>
                                )}
                            />
                        )}

                        {role === 'ROLE_STUDENT' && (
                            <FormField
                                control={form.control}
                                name="classId"
                                render={({ field }: { field: ControllerRenderProps<FormValues, 'classId'> }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Lớp học (Không bắt buộc)</FormLabel>
                                        <FormControl>
                                            <select
                                                className="flex h-12 w-full rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-bold appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-[length:1.25rem_1.25rem] bg-no-repeat pr-10"
                                                value={field.value || ''}
                                                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                                            >
                                                <option value="">-- Chọn lớp học --</option>
                                                {classes.map((c) => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormControl>
                                        <FormMessage className="text-[10px] uppercase font-bold" />
                                    </FormItem>
                                )}
                            />
                        )}

                        {isEdit && (
                             <FormField
                                control={form.control}
                                name="isActive"
                                render={({ field }: { field: ControllerRenderProps<FormValues, 'isActive'> }) => (
                                    <FormItem>
                                        <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Trạng thái</FormLabel>
                                        <FormControl>
                                            <select
                                                className="flex h-12 w-full rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-bold appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[position:right_0.5rem_center] bg-[length:1.25rem_1.25rem] bg-no-repeat pr-10"
                                                value={field.value ? 'true' : 'false'}
                                                onChange={(e) => field.onChange(e.target.value === 'true')}
                                            >
                                                <option value="true">Đang hoạt động</option>
                                                <option value="false">Tạm dừng</option>
                                            </select>
                                        </FormControl>
                                        <FormMessage className="text-[10px] uppercase font-bold" />
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter className="gap-3 pt-4">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => onOpenChange(false)}
                                className="h-12 rounded-xl flex-1 font-black transition-all hover:bg-muted border-2 tracking-widest uppercase"
                            >
                                Hủy
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={submitting}
                                className="h-12 rounded-xl flex-1 font-black bg-primary tracking-widest uppercase"
                            >
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEdit ? 'CẬP NHẬT' : 'TẠO MỚI'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
