/**
 * Modal — Dialog dùng Headless UI (ESC, focus trap, click outside)
 *
 * Tính năng:
 *  - ESC đóng modal
 *  - Click outside đóng (khi allowClose=true)
 *  - Focus trap tự động
 *  - Body scroll lock khi mở
 *
 * @example
 *   <Modal open={isOpen} onClose={() => setIsOpen(false)} title="Thêm thuốc" size="lg">
 *     <form>...</form>
 *   </Modal>
 */
import { Dialog } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

const SIZE_CLASSES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  '2xl': 'max-w-4xl',
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showCloseButton = true,
  className,
}) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm"
        aria-hidden="true"
      />

      {/* Container */}
      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel
            className={cn(
              'w-full bg-white rounded-modal shadow-modal',
              'transform transition-all duration-200',
              SIZE_CLASSES[size],
              'max-h-[90vh] overflow-hidden flex flex-col',
              className
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-neutral-200">
                <div className="flex-1 min-w-0">
                  {title && (
                    <Dialog.Title className="text-h3 text-neutral-900 truncate">
                      {title}
                    </Dialog.Title>
                  )}
                  {description && (
                    <p className="mt-1 text-caption text-neutral-500">{description}</p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    type="button"
                    onClick={onClose}
                    className={cn(
                      'flex-shrink-0 p-1.5 rounded-btn text-neutral-400',
                      'hover:text-neutral-700 hover:bg-neutral-100',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
                    )}
                    aria-label="Đóng"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}
