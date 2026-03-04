import { cn } from '@/lib/utils';

interface AdminTableProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminTable({ children, className }: AdminTableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}

export function AdminTh({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={cn(
        'text-left px-3 sm:px-5 py-2.5 sm:py-3 text-white/50 font-medium text-xs uppercase tracking-wider',
        className
      )}
    >
      {children}
    </th>
  );
}

export function AdminTd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={cn('px-3 sm:px-5 py-2.5 sm:py-3 text-white/80', className)}>
      {children}
    </td>
  );
}
