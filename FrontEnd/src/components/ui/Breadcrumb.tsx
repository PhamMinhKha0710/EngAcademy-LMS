import { Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
    label: string
    path?: string
}

interface BreadcrumbProps {
    items: BreadcrumbItem[]
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
    return (
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-blue-500 transition-colors flex items-center">
                <Home className="w-4 h-4" />
            </Link>

            {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    {item.path && index < items.length - 1 ? (
                        <Link to={item.path} className="hover:text-blue-500 transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-900 font-medium dark:text-gray-200">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    )
}

export default Breadcrumb
