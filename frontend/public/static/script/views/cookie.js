const DAYS_TO_MS = 864e5;

/**
 * Create a new cookie
 * @param {String} name The new cookie's name
 * @param {String|Number} value The new cookie's value
 * @param {Number} [days=1] The numbers of days before expiration (default is 1)
 * 
 * @example
 * createCookie("myCookie", 42);
 * createCookie("weekCookie", "nice", 7);
 */
function createCookie(name, value, days=1) {
  let exp_date = new Date();
  exp_date.setTime(exp_date.getTime() + days * DAYS_TO_MS);
  exp_date = `expires=${exp_date.toUTCString()}`;
  document.cookie = `${name}=${value};${exp_date}`;
}

/**
 * Gets all cookies and return a JSON of them
 * @returns {Object} A JSON containing the cookies in name => value form
 * 
 * @example
 * let cookies = getCookies();
 */
function getCookies() {
  let raw_data = document.cookie;

  let all_cookies = raw_data.split(";")
    .map(cookie => cookie.split("="))
    .map(cookie => [cookie[0].trim(), cookie[1]]);

  return Object.fromEntries(all_cookies);
}

/**
 * Remove cookies from the cookie list
 * @param {...String} names The cookies to remove
 * 
 * @example
 * removeCookie("cookieToDelete");
 * removeCookie("cookie1", "cookie2", "cookie3");
 */
function removeCookie(...names) {
  names.forEach(cookie => createCookie(cookie, "", -1));
}


/**
 * Check if cookies are defined in the cookie list
 * @param  {...String} names The cookies to check
 * @returns {Boolean} Are the cookies given defined ?
 * 
 * @example
 * isCookieDefined("cookieToTest");
 * isCookieDefined("cookie1", "cookie2", "cookie3");
 */
function isCookieDefined(...names) {
  let all_cookies = Object.keys(getCookies());

  for (let i = 0 ; i < names.length ; i++) {
    if (all_cookies.indexOf(names[i]) === -1) {
      return false;
    }
  }

  return true;
}


/**
 * Edit a cookie. Return a boolean telling if the cookie has been edited.
 * @param {String} name The cookie to edit
 * @param {String|Number} new_value The new cookie value
 * @returns {Boolean} Has the cookie been edited ?
 * 
 * @example
 * editCookie("oldCookie", "Better value");
 */
function editCookie(name, new_value) {
  if (!isCookieDefined(name)) return false;

  createCookie(name, new_value);
  return true;
}