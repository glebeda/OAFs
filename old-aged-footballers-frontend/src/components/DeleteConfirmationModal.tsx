import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FaExclamationTriangle } from 'react-icons/fa';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  playerName: string;
}

export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, playerName }: DeleteConfirmationModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-center mb-4 text-red-600">
                  <FaExclamationTriangle size={48} />
                </div>
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 text-center"
                >
                  Delete Player
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 text-center">
                    Are you sure you want to delete <span className="font-semibold">{playerName}</span>? This action cannot be undone.
                  </p>
                </div>

                <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-center space-y-3 space-y-reverse sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    onClick={onConfirm}
                    aria-label={`Confirm delete ${playerName}`}
                  >
                    Delete
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 