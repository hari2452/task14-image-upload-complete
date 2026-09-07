import { useRef, useState } from "react";

export default function useToast() {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  return {
    toast,
    showToast,
  };
}
