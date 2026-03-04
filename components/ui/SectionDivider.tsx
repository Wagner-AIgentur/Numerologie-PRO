import { cn } from '@/lib/utils';

interface SectionDividerProps {
  className?: string;
}

export default function SectionDivider({ className }: SectionDividerProps) {
  return (
    <div
      className={cn('w-20 h-[2px] bg-gold-gradient mx-auto my-8', className)}
      aria-hidden="true"
    />
  );
}
