import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { SENTRY_DSN } from 'lib/constants';
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { App } from './App';

Sentry.init({
  dsn: SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
  debug: process.env.REACT_APP_DEBUG_LOGS === 'true',
});

ReactDOM.render(
  <StrictMode>
    <App />
  </StrictMode>,
  document.getElementById('root'),
);
