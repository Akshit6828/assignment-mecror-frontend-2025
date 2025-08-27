import { useEffect, useState } from "react";

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);
  const [warningmessage, setWarningMessage] = useState(
    "Seems Like you are offline. Please check your internet connection"
  );

  useEffect(() => {
    function handleOnline() {
      setIsOnline(false);
      setWarningMessage("Updating page, Please wait a moment...");
      setTimeout(() => {
        window.location.reload();
      }, 50);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return [isOnline, warningmessage];
}

export default useOnlineStatus;
