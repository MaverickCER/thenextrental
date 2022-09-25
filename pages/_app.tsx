import '../styles/globals.css';

import { useCallback, useEffect } from 'react';

import { AppProps } from 'next/app';
import { AuthProvider } from '../context/auth';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { analytics } from '../utils/firebase';
import { hotjar } from 'react-hotjar';
import { logEvent } from 'firebase/analytics';
import theme from '../styles/theme';
import { useRouter } from 'next/router';

const MyApp = (props: AppProps) => {
  const { Component, pageProps } = props;
  const router = useRouter();

  const routerEvent = useCallback(async () => {
    if (analytics && window.location.hostname !== 'localhost') {
      hotjar.initialize(2873078, 6);

      logEvent(analytics, 'screenview', {
        firebase_screen: router.pathname,
      });
    }
  }, [router.pathname]);

  useEffect(() => {
    routerEvent();
    router.events.on('routeChangeComplete', routerEvent);
    return () => {
      router.events.off('routeChangeComplete', routerEvent);
    };
  }, [router.events, routerEvent]);

  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default MyApp;
