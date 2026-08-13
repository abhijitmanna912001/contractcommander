import { motion, useReducedMotion } from "motion/react";
import { useCallback, useId, useState, type ChangeEvent, type DragEvent } from "react";
import "./UploadZone.css";

const ACCEPTED_EXTENSIONS = [".pdf", ".txt"];
const ACCEPTED_MIME_TYPES = ["application/pdf", "text/plain"];

// Literal colors mirroring the CSS custom properties in index.css. Motion
// needs concrete color values to interpolate between (it can't reliably
// resolve var() references frame-by-frame), so the border/background states
// below are kept in sync with --border, --accent, --accent-border,
// --accent-bg, and --surface-muted by hand.
const REST_BORDER = "rgba(255, 255, 255, 0.08)";
const HOVER_BORDER = "rgba(212, 175, 55, 0.35)";
const DRAG_BORDER = "#d4af37";
const REST_BG = "#1c2128";
const ACTIVE_BG = "rgba(212, 175, 55, 0.12)";

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
  const shouldReduceMotion = useReducedMotion();

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

  const zoneAnimate = disabled
    ? { opacity: 0.55, borderColor: REST_BORDER, backgroundColor: REST_BG, borderWidth: 2 }
    : isDragging
      ? { opacity: 1, borderColor: DRAG_BORDER, backgroundColor: ACTIVE_BG, borderWidth: 3 }
      : { opacity: 1, borderColor: REST_BORDER, backgroundColor: REST_BG, borderWidth: 2 };

  const iconAnimate = shouldReduceMotion
    ? undefined
    : isDragging
      ? { scale: 1.15, y: 0 }
      : { scale: 1, y: [0, -4, 0] };

  const iconTransition = shouldReduceMotion
    ? undefined
    : isDragging
      ? { duration: 0.2, ease: "easeOut" as const }
      : { duration: 3, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div className="upload-zone-wrapper">
      <motion.label
        htmlFor={inputId}
        className={["upload-zone", disabled && "upload-zone--disabled"].filter(Boolean).join(" ")}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        animate={zoneAnimate}
        whileHover={disabled ? undefined : { borderColor: HOVER_BORDER, backgroundColor: ACTIVE_BG }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <motion.span
          className="upload-zone__icon"
          aria-hidden="true"
          animate={iconAnimate}
          transition={iconTransition}
        >
          📄
        </motion.span>
        <p className="upload-zone__title">Drag & drop your contract here</p>
        <p className="upload-zone__subtitle">
          or <span className="upload-zone__browse">browse files</span>. PDF or plain text.
        </p>
        <input
          id={inputId}
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          onChange={handleInputChange}
          disabled={disabled}
          className="upload-zone__input"
        />
      </motion.label>
      {error && (
        <p className="upload-zone__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
