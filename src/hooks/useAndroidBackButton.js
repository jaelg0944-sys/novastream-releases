import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { App as CapApp } from '@capacitor/app';

export function useAndroidBackButton() {
  const navigate = useNavigate();

  useEffect(() => {
    let listener;
    const setup = async () => {
      listener = await CapApp.addListener('backButton', ({ canGoBack }) => {
        if (canGoBack) {
          navigate(-1);
        } else {
          CapApp.exitApp();
        }
      });
    };
    setup();
    return () => {
      if (listener) listener.remove();
    };
  }, [navigate]);
}
