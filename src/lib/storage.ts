interface StoredData<T> {
  value: T;
  expires: number;
}

export const setWithExpiry = <T>(key: string, value: T, ttl: number) => {
  const item: StoredData<T> = {
    value,
    expires: Date.now() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
};

export const getWithExpiry = <T>(key: string): T | null => {
  const itemStr = localStorage.getItem(key);
  if (!itemStr) return null;

  const item: StoredData<T> = JSON.parse(itemStr);
  if (Date.now() > item.expires) {
    localStorage.removeItem(key);
    return null;
  }

  return item.value;
}; 