import { useRef, useState } from 'react';
import { Button } from './ui/Button.tsx';

/**
 * Keyboard-accessible drag-and-drop zone. Accepts .cfg/.conf/.txt.
 * Parent owns file state via onFiles().
 */
export function UploadDropzone({
  onFiles,
  disabled,
}: {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (disabled) return;
    const files = Array.from(e.dataTransfer.files).filter(Boolean);
    if (files.length) onFiles(files);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload device config files. Press Enter to browse."
      aria-disabled={disabled}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`rounded-xl border-2 border-dashed p-10 text-center transition ${
        dragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30'
          : 'border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900'
      } ${disabled ? 'opacity-60' : 'cursor-pointer'}`}
    >
      <p className="text-base font-medium">Drag & drop config files here</p>
      <p className="mt-1 text-sm text-gray-500">.cfg, .conf, .txt — multi-file supported, 5MB max each</p>
      <div className="mt-4">
        <Button
          variant="secondary"
          type="button"
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          Browse files
        </Button>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".cfg,.conf,.txt,.text"
        className="sr-only"
        aria-label="Choose config files"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          if (files.length) onFiles(files);
          e.target.value = '';
        }}
      />
    </div>
  );
}
