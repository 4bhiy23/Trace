import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-full border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:border-[var(--coral)] focus-visible:ring-2 focus-visible:ring-[var(--coral)]/40 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--coral)] text-white hover:bg-[#e25e4a] shadow-[0_14px_26px_-16px_rgba(237,111,92,1)] hover:-translate-y-px",
        outline:
          "border-[var(--line)] bg-[var(--bone)] text-[var(--foreground)] hover:bg-[var(--paper-warm)] hover:text-[var(--foreground)] hover:border-[var(--line-soft)]",
        secondary:
          "bg-[var(--paper-warm)] text-[var(--ink)] hover:bg-[var(--paper-dark)] border border-[var(--line)]",
        ghost:
          "border border-transparent hover:bg-[rgba(21,20,15,0.06)] hover:text-[var(--foreground)] dark:hover:bg-[rgba(239,231,210,0.06)]",
        destructive:
          "bg-[var(--coral)]/15 text-[var(--coral)] hover:bg-[var(--coral)] hover:text-white border border-[var(--coral)]/30",
        link: "text-[var(--coral)] underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-2 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "h-6 gap-1 px-2.5 text-xs",
        sm: "h-7 gap-1.5 px-3 text-[0.8rem]",
        lg: "h-10 gap-2 px-5 text-sm",
        icon: "size-8 rounded-full",
        "icon-xs": "size-6 rounded-full",
        "icon-sm": "size-7 rounded-full",
        "icon-lg": "size-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
