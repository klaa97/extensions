import { environment } from "@raycast/api";
import { resolve } from "path";
import { LocalStorage } from "node-localstorage";
import { Middleware } from "swr";
import { useEffect } from "react";

const SWR_CACHE_KEY = "swr-swrCache";

const location = resolve(environment.supportPath, "local-storage");
const localStorage = new LocalStorage(location);

const swrCache = localStorage.getItem(SWR_CACHE_KEY);
const cacheProvider = new Map(swrCache ? JSON.parse(swrCache) : []);

const persistCacheMiddleware: Middleware = (useSWRNext) => {
  return (key, fetcher, config) => {
    const swr = useSWRNext(key, fetcher, config);

    useEffect(() => {
      try {
        const value = JSON.stringify(Array.from(cacheProvider.entries()));
        localStorage.setItem(SWR_CACHE_KEY, value);
      } catch (error) {
        console.error("Failed persisting swrCache", error);
      }
    }, [swr.data]);

    return swr;
  };
};

export const cacheConfig = {
  provider: () => cacheProvider,
  use: [persistCacheMiddleware],
};
