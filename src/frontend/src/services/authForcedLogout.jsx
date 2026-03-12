let logoutFn = null;

export const registerForcedLogout = (fn) => {
  logoutFn = fn;
};

export const forceLogout = () => {
  if (logoutFn) logoutFn();
};
