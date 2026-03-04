'use client';

import { Calendar } from 'lucide-react';
import CalBookingButton from '@/components/ui/CalBookingButton';

interface DashboardBookButtonProps {
  calLink: string;
  label: string;
}

export default function DashboardBookButton({ calLink, label }: DashboardBookButtonProps) {
  return (
    <CalBookingButton calLink={calLink} variant="primary" size="sm">
      <Calendar className="h-3.5 w-3.5 mr-1.5" strokeWidth={2} />
      {label}
    </CalBookingButton>
  );
}
