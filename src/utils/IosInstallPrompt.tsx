import { useEffect, useState } from 'react';

function isIos() {
  return (
    typeof window !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !('MSStream' in window)
  );
}

export default function IosInstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const alreadyShown = localStorage.getItem('iosInstallPromptShown');
    if (alreadyShown) return;
    if (isIos()) {
      setShow(true);
      localStorage.setItem('iosInstallPromptShown', 'true');
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg px-4 py-2 flex items-center z-50">
      <span className="mr-2">To install MyApp, tap <b>Share</b> <span style={{fontSize:'1.2em'}}>⬆️</span> and choose <b>Add to Home Screen</b>.</span>
      <button className="ml-2 text-gray-500" onClick={() => setShow(false)}>
        Dismiss
      </button>
    </div>
  );
}
