import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormErrorMessageProps {
  message?: string;
  className?: string;
}

export const FormErrorMessage = ({ message, className }: FormErrorMessageProps) => {
  if (!message) return null;

  return (
    <div
      className={cn(
        "mt-2 flex items-center gap-2 rounded-md border border-destructive bg-destructive/10 p-2 text-sm text-destructive",
        className
      )}
    >
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <p>{message}</p>
    </div>
  );
};