"use client"
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  itemName?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Konfirmasi Hapus',
  message,
  itemName,
}) => {
  if (!isOpen) return null;

  const displayMessage =
    message ||
    (itemName
      ? `Apakah Anda yakin ingin menghapus "${itemName}"? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.`
      : 'Apakah Anda yakin ingin menghapus item ini? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.');

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[#121217] border border-red-500/30 rounded-2xl max-w-md w-full shadow-[0_0_60px_rgba(239,68,68,0.15)] animate-in zoom-in-95 fade-in duration-200">
        {/* Glow ring */}
        <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-red-500/20 via-transparent to-transparent pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-zinc-600 hover:text-zinc-300 transition-colors rounded-lg hover:bg-white/5"
        >
          <X size={16} />
        </button>

        <div className="relative p-6">
          {/* Icon */}
          <div className="flex justify-center mb-5">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse">
              <AlertTriangle size={28} className="text-red-500" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-center text-lg font-bold text-white mb-2 font-sans">{title}</h3>

          {/* Message */}
          <p className="text-center text-sm text-zinc-400 leading-relaxed mb-8 px-2">{displayMessage}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-zinc-800/80 hover:bg-zinc-700 border border-white/5 text-zinc-300 text-sm font-bold rounded-xl transition-all uppercase tracking-wider font-mono"
            >
              Batal
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] uppercase tracking-wider font-mono flex items-center justify-center gap-2"
            >
              <AlertTriangle size={14} />
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
