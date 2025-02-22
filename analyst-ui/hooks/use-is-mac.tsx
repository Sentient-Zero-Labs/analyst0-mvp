import { useEffect, useState } from "react";

export function useIsMac() {
  const [isMac, setIsMac] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    setIsMac(/macOS|Mac|iPhone|iPad/i.test(navigator.userAgent));
  }, []);

  return !!isMac;
}
