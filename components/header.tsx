import Link from "next/link"
import { Settings, BarChart2 } from "lucide-react"

export default function Header() {
  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">MyFocusDash</h1>
      <div className="flex items-center gap-2">
        <Link
          href="/summary"
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-md transition-colors"
          title="Weekly Summary"
        >
          <BarChart2 className="h-5 w-5" />
        </Link>
        <Link
          href="/theme"
          className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 rounded-md transition-colors"
          title="Theme Settings"
        >
          <Settings className="h-5 w-5" />
        </Link>
      </div>
    </header>
  )
}
