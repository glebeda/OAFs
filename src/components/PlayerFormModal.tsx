import React from 'react';
import { Dialog } from '@headlessui/react';
import { Player } from '@/types/player';

type PlayerFormModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Player, 'id'>) => void;
  player?: Player;
};

export const PlayerFormModal: React.FC<PlayerFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  player,
}) => {
  const [formData, setFormData] = React.useState({
    name: player?.name || '',
    email: player?.email || '',
    phoneNumber: player?.phoneNumber || '',
    joinedDate: player?.joinedDate || new Date().toISOString().split('T')[0],
    isActive: player?.isActive ?? true,
  });

  const [nameError, setNameError] = React.useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNameError(null);

    if (!formData.name.trim()) {
      setNameError('Name is required');
      return;
    }

    onSubmit(formData);
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-10"
    >
      <div className="fixed inset-0 bg-black bg-opacity-25" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-0 sm:p-4 text-center">
          <Dialog.Panel className="w-full h-full sm:h-auto sm:max-w-md transform overflow-hidden bg-white p-4 sm:p-6 text-left align-middle shadow-xl transition-all sm:rounded-2xl">
            <Dialog.Title className="text-lg font-medium leading-6 text-gray-900 mb-4">
              {player ? 'Edit Player' : 'Add New Player'}
            </Dialog.Title>
            <form onSubmit={handleSubmit} className="mt-4 space-y-6" noValidate>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  aria-invalid={!!nameError}
                  aria-describedby={nameError ? "name-error" : undefined}
                  className={`mt-1 block w-full rounded-md shadow-sm text-base sm:text-sm
                    ${nameError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
                />
                {nameError && (
                  <p id="name-error" className="mt-1 text-sm text-red-600" role="alert">
                    {nameError}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={e => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="joinedDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Joined Date *
                </label>
                <input
                  id="joinedDate"
                  name="joinedDate"
                  type="date"
                  required
                  value={formData.joinedDate}
                  onChange={e => setFormData(prev => ({ ...prev, joinedDate: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="isActive"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Status
                </label>
                <select
                  id="isActive"
                  name="isActive"
                  value={formData.isActive.toString()}
                  onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base sm:text-sm"
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base sm:text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base sm:text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                >
                  {player ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
}; 