import { forwardRef } from 'react';

export const NotesInput = forwardRef(function NotesInput({ value, onChange }, ref) {
  return (
    <div>
      <label className="text-sm text-gray-400 block mb-2">
        Notes (optional):
      </label>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What did you learn? Press 'n' to focus"
        className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
      />
    </div>
  );
});
