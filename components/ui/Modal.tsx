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
    <div className="fixed inset-0 z-50 flex h-screen items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md max-h-[calc(100vh-4rem)] overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-900/5">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <p className="text-lg font-semibold text-slate-900">{title}</p>
          </div>
          <button className="text-slate-400 hover:text-slate-600" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6 text-sm text-slate-600">{message}</div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:justify-end">
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
