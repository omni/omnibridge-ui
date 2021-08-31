import axios from 'axios';
import { logError } from 'lib/helpers';
import { useEffect, useState } from 'react';

const COINZILLA_TEXT_API_URL = `https://request-global.czilladx.com/serve/native.php`;

export const useCoinzillaText = () => {
  const [isFetching, setIsFetching] = useState(true);
  const [adFetchError, setAdFetchError] = useState(null);
  const [adData, setAdData] = useState(null);

  useEffect(() => {
    (async function fetchAdvertisement() {
      try {
        if (!process.env.REACT_APP_COINZILLA_API_KEY)
          throw new Error('Cannot fetch advertisement');

        const { data } = await axios.get(COINZILLA_TEXT_API_URL, {
          params: { z: process.env.REACT_APP_COINZILLA_API_KEY },
        });

        setAdData(data);
      } catch (err) {
        logError(err);
        setAdFetchError(err);
      } finally {
        setIsFetching(false);
      }
    })();
  }, []);

  return {
    adData,
    isFetching,
    adFetchError,
  };
};
