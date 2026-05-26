

// Set a cookie with configurable SameSite
export const setCookie = (name, value, days, sameSite = "Lax") => {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }

  // Secure flag only if https OR if SameSite=None (required by browsers)
  const secureFlag =
    window.location.protocol === "https:" || sameSite === "None"
      ? "; Secure"
      : "";

  document.cookie = `${name}=${encodeURIComponent(value || "")}${expires}; Path=/${secureFlag}; SameSite=${sameSite}`;
};

// Set a language cookie
export const setCookieForLang = (name, value, sameSite = "Lax") => {
  const secureFlag =
    window.location.protocol === "https:" || sameSite === "None"
      ? "; Secure"
      : "";

  document.cookie = `${name}=${encodeURIComponent(value || "")}; Path=/${secureFlag}; SameSite=${sameSite}`;
};

// Get a cookie
export const getCookie = (name) => {
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(";");
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
};

// Delete a cookie
export const deleteCookie = (name, sameSite = "Lax") => {
  const secureFlag =
    window.location.protocol === "https:" || sameSite === "None"
      ? "; Secure"
      : "";

  document.cookie = `${name}=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secureFlag}; SameSite=${sameSite}`;
};
