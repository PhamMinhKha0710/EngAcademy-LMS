import { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import EmptyState from './EmptyState'
import { Inbox } from 'lucide-react'

interface Column<T> {
    key: string
    label: string
    render?: (item: T, index: number) => ReactNode
}

interface DataTableProps<T> {
    columns: Column<T>[]
    data: T[]
    loading?: boolean
    emptyMessage?: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DataTable<T extends Record<string, any>>({
    columns,
    data,
    loading = false,
    emptyMessage = 'Không có dữ liệu',
}: DataTableProps<T>) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (data.length === 0) {
        return (
            <EmptyState
                icon={<Inbox className="w-8 h-8" />}
                title={emptyMessage}
            />
        )
    }

    return (
        <div className="w-full overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--color-bg-secondary)' }}>
            <table className="w-full text-left">
                <thead>
                    <tr style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className="px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-bg-secondary)' }}>
                    {data.map((row, rowIndex) => (
                        <tr
                            key={rowIndex}
                            className="transition-colors hover:bg-slate-800/30"
                            style={{ backgroundColor: 'var(--color-bg)' }}
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    className="px-4 py-3 text-sm"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    {col.render
                                        ? col.render(row, rowIndex)
                                        : (row[col.key] as ReactNode)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
