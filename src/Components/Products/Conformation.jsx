import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";

export default function ConfirmRemove({ onConfirm, itemName }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
          Remove
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[320px] p-6 bg-white rounded-md shadow-lg transform -translate-x-1/2 -translate-y-1/2">
          <Dialog.Title className="text-lg font-semibold">Confirm Removal</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-gray-600">
            Are you sure you want to remove <strong>{itemName}</strong>? This cannot be undone.
          </Dialog.Description>

          <div className="mt-4 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button className="px-3 py-1 bg-gray-300 rounded">Cancel</button>
            </Dialog.Close>
            <button
              onClick={() => {
                onConfirm();
              }}
              className="px-3 py-1  text-white rounded"
              style={{ background:' linear-gradient(135deg, #ff4d6d, #ff6f91)'}}
            >
              Remove
            </button>
          </div>

          <Dialog.Close asChild>
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <Cross2Icon />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
