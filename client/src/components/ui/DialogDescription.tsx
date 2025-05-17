import * as React from "react"
import { DialogDescription as DialogDescriptionPrimitive } from "@radix-ui/react-dialog"

import { cn } from "@/lib/utils"

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogDescriptionPrimitive>,
  React.ComponentPropsWithoutRef<typeof DialogDescriptionPrimitive>
>(({ className, ...props }, ref) => (
  <DialogDescriptionPrimitive
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogDescriptionPrimitive.displayName

export { DialogDescription }