import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-medium tracking-wide uppercase",
  {
    variants: {
      variant: {
        default: "bg-elevated text-muted",
        ok: "bg-ok/15 text-ok",
        warn: "bg-warn/15 text-warn",
        bad: "bg-danger/15 text-danger",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
