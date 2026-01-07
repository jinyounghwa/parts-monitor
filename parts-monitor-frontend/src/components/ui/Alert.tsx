import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react"

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive" | "success" | "info"
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-gray-50 border-gray-200 text-gray-900 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100",
      destructive: "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-200",
      success: "bg-green-50 border-green-200 text-green-900 dark:bg-green-950/30 dark:border-green-900/50 dark:text-green-200",
      info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-200",
    }

    const icons = {
      default: Info,
      destructive: XCircle,
      success: CheckCircle,
      info: Info,
    }

    const Icon = icons[variant]

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2 rounded-lg border p-4",
          variants[variant],
          className
        )}
        {...props}
      >
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1">{props.children}</div>
      </div>
    )
  }
)
Alert.displayName = "Alert"

export { Alert }
