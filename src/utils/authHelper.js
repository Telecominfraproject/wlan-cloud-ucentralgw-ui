export const logout = () => {
  sessionStorage.clear();
  window.location.replace('/');
};

export const getToken = () => {
  const token = sessionStorage.getItem('access_token');
  if (token === undefined || token === null) {
    logout();
    return null;
  }
  return token;
};
