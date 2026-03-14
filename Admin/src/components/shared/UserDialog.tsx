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
})

type FormValues = {
    username: string;
    fullName: string;
    email: string;
    password?: string;
    isActive: boolean;
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
    const isEdit = !!user

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            fullName: '',
            email: '',
            password: '',
            isActive: true,
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
                })
            } else {
                form.reset({
                    username: '',
                    fullName: '',
                    email: '',
                    password: '',
                    isActive: true,
                })
            }
        }
    }, [open, user, form])

    const onSubmit = async (values: FormValues) => {
        setSubmitting(true)
        try {
            if (isEdit) {
                const updateData = {
                    fullName: values.fullName,
                    email: values.email,
                    roles: [role],
                    isActive: values.isActive,
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
            <DialogContent className="sm:max-w-[500px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black">
                        {isEdit ? `Chỉnh sửa ${title}` : `Thêm ${title} mới`}
                    </DialogTitle>
                    <DialogDescription>
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
                                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tên đăng nhập</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="username" 
                                            {...field} 
                                            disabled={isEdit}
                                            className="h-11 rounded-xl bg-muted/30 border-border/50 focus-visible:ring-primary/20" 
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
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Họ và tên</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="Nguyễn Văn A" 
                                                {...field} 
                                                className="h-11 rounded-xl bg-muted/30 border-border/50 focus-visible:ring-primary/20" 
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
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email</FormLabel>
                                        <FormControl>
                                            <Input 
                                                placeholder="example@gmail.com" 
                                                {...field} 
                                                className="h-11 rounded-xl bg-muted/30 border-border/50 focus-visible:ring-primary/20" 
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
                                        <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Mật khẩu</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="password" 
                                                placeholder="••••••••" 
                                                {...field} 
                                                className="h-11 rounded-xl bg-muted/30 border-border/50 focus-visible:ring-primary/20" 
                                            />
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
                                    <FormItem className="flex flex-row items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-sm font-bold">Trạng thái hoạt động</FormLabel>
                                            <p className="text-xs text-muted-foreground">Người dùng có thể đăng nhập vào hệ thống.</p>
                                        </div>
                                        <FormControl>
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={field.onChange}
                                                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter className="pt-4">
                            <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => onOpenChange(false)}
                                className="h-12 px-6 rounded-xl font-bold transition-all"
                            >
                                Hủy
                            </Button>
                            <Button 
                                type="submit" 
                                disabled={submitting}
                                className="h-12 px-8 rounded-xl font-bold bg-primary transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
