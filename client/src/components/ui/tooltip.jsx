import React from 'react';

const TooltipProvider = ({ children, ...props }) => {
  return <div {...props}>{children}</div>;
};

const Tooltip = ({ children }) => {
  return <div>{children}</div>;
};

const TooltipTrigger = React.forwardRef(({ children, ...props }, ref) => (
  <div ref={ref} {...props}>
    {children}
  </div>
));

const TooltipContent = React.forwardRef(({ children, className, ...props }, ref) => (
  <div
    ref={ref}
    className={`z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md ${className}`}
    {...props}
  >
    {children}
  </div>
));

TooltipTrigger.displayName = "TooltipTrigger";
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };