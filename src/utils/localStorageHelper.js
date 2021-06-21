export const setItem = (key, value) => {
  if (!key || !value) {
    return false;
  }
  localStorage.setItem(key, value);
  return true;
};

export const getItem = (key) => localStorage.getItem(key);
