import { useCallback, useId, useState, type ChangeEvent, type DragEvent } from "react";
import "./UploadZone.css";

const ACCEPTED_EXTENSIONS = [".pdf", ".txt"];
const ACCEPTED_MIME_TYPES = ["application/pdf", "text/plain"];

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

function isAcceptedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const hasAcceptedExtension = ACCEPTED_EXTENSIONS.some((ext) => name.endsWith(ext));
  const hasAcceptedMimeType = ACCEPTED_MIME_TYPES.includes(file.type);
  return hasAcceptedExtension || hasAcceptedMimeType;
}

export function UploadZone({ onFileSelected, disabled = false }: UploadZoneProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File | undefined | null) => {
      if (!file) return;
      if (!isAcceptedFile(file)) {
        setError("Please upload a PDF or plain text (.txt) file.");
        return;
      }
      setError(null);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    handleFile(event.dataTransfer.files?.[0]);
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleFile(event.target.files?.[0]);
    event.target.value = ""; // allow re-selecting the same file after an error
  };

  const classNames = [
    "upload-zone",
    isDragging && "upload-zone--dragging",
    disabled && "upload-zone--disabled",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="upload-zone-wrapper">
      <label
        htmlFor={inputId}
        className={classNames}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <span className="upload-zone__icon" aria-hidden="true">
          📄
        </span>
        <p className="upload-zone__title">Drag & drop your contract here</p>
        <p className="upload-zone__subtitle">
          or <span className="upload-zone__browse">browse files</span> — PDF or plain text
        </p>
        <input
          id={inputId}
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          onChange={handleInputChange}
          disabled={disabled}
          className="upload-zone__input"
        />
      </label>
      {error && (
        <p className="upload-zone__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
