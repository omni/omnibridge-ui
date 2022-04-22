import { COINZILLA_API_KEY } from 'lib/constants';
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
        if (COINZILLA_API_KEY) {
          const res = await fetch(
            `${COINZILLA_TEXT_API_URL}?z=${COINZILLA_API_KEY}`,
          );
          if (res.ok) {
            const data = await res.json();
            setAdData(data);
          }
        }
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
