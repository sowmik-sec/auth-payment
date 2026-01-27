import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const SelectContext = React.createContext<{
    value: string
    onValueChange: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
} | null>(null)

export const Select = ({
    value,
    onValueChange,
    children,
}: {
    value: string
    onValueChange: (val: string) => void
    children: React.ReactNode
}) => {
    const [open, setOpen] = React.useState(false)

    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
            <div className="relative font-sans text-sm">{children}</div>
        </SelectContext.Provider>
    )
}

export const SelectTrigger = ({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectTrigger must be used within Select")

    return (
        <div
            onClick={() => context.setOpen(!context.open)}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
                className
            )}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </div>
    )
}

export const SelectValue = ({
    placeholder,
    className,
}: {
    placeholder?: string
    className?: string
}) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectValue must be used within Select")

    return (
        <span className={cn("block truncate", className)}>
            {context.value ? (
                // Capitalize functionality or mapping should happen in parent, 
                // but here we just show the raw value or let children render if passed differently.
                // For simple emulation, we just show the value. Ideally, SelectValue should find the children of the selected Item.
                // A simple hack: capitalize if it looks like a simple string
                context.value.charAt(0).toUpperCase() + context.value.slice(1)
            ) : (
                <span className="text-muted-foreground">{placeholder}</span>
            )}
        </span>
    )
}

export const SelectContent = ({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectContent must be used within Select")

    if (!context.open) return null

    return (
        <div
            className={cn(
                "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 w-full mt-1",
                className
            )}
            {...props}
        >
            <div className="p-1">{children}</div>
        </div>
    )
}

export const SelectItem = ({
    value,
    children,
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectItem must be used within Select")

    const isSelected = context.value === value

    return (
        <div
            onClick={() => {
                context.onValueChange(value)
                context.setOpen(false)
            }}
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-pointer",
                isSelected && "bg-accent/50",
                className
            )}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <Check className="h-4 w-4" />}
            </span>
            {children}
        </div>
    )
}
