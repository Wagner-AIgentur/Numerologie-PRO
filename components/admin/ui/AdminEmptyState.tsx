import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface AdminEmptyStateProps {
  icon: LucideIcon;
  text: string;
  className?: string;
}

export function AdminEmptyState({ icon: Icon, text, className }: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 border-2 border-dashed border-white/10 rounded-2xl',
        className
      )}
    >
      <Icon className="w-10 h-10 text-white/20 mb-3" />
      <p className="text-white/30 text-sm">{text}</p>
    </div>
  );
}
