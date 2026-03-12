"use client";

import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
}

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const colors = {
  success: "border-l-green-500",
  error: "border-l-red-500",
  info: "border-l-blue-500",
};

const iconColors = {
  success: "text-green-500",
  error: "text-red-500",
  info: "text-blue-500",
};

export function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastData;
  onDismiss: (id: string) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  function handleDismiss() {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 200);
  }

  const Icon = icons[toast.type];

  return (
    <div
      className={`flex items-start gap-3 bg-eerie-black-1 border border-jet border-l-4 ${colors[toast.type]} rounded-xl px-4 py-3 shadow-lg transition-all duration-200 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
      role="alert"
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColors[toast.type]}`} />
      <p className="text-white-2 text-sm flex-1">{toast.message}</p>
      <button
        onClick={handleDismiss}
        className="text-light-gray-70 hover:text-white-2 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
