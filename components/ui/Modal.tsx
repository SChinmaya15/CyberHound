import React from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

export interface ModalProps {
  open: boolean;
  title: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onClose: () => void;
  variant?: 'default' | 'danger';
}

export const Modal: React.FC<ModalProps> = ({
  open,
  title,
  message,
  confirmLabel = 'OK',
  cancelLabel,
  onConfirm,
  onClose,
  variant = 'default',
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 sm:items-center">
      <div className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-slate-900/5">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-lg font-semibold text-slate-900">{title}</p>
          </div>
          <button className="text-slate-400 hover:text-slate-600" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-6 text-sm text-slate-600">{message}</div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
          {cancelLabel && (
            <Button variant="outline" size="md" className="w-full sm:w-auto" onClick={onClose}>
              {cancelLabel}
            </Button>
          )}
          {onConfirm ? (
            <Button
              variant={variant === 'danger' ? 'danger' : 'primary'}
              size="md"
              className="w-full sm:w-auto"
              onClick={() => {
                onConfirm();
              }}
            >
              {confirmLabel}
            </Button>
          ) : (
            <Button variant="primary" size="md" className="w-full sm:w-auto" onClick={onClose}>
              {confirmLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
