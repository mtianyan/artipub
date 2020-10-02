const LinvoDB = require('linvodb3');
var Promise = require("bluebird");

const cookieSchema = {
    /** The domain of the cookie (e.g. "www.google.com", "example.com"). */
    domain: String,
    /** The name of the cookie. */
    name: String,
    /** The value of the cookie. */
    value: String,
    /** True if the cookie is a session cookie, as opposed to a persistent cookie with an expiration date. */
    session: Boolean,
    /** True if the cookie is a host-only cookie (i.e. a request's host must exactly match the domain of the cookie). */
    hostOnly: Boolean,
    /** Optional. The expiration date of the cookie as the number of seconds since the UNIX epoch. Not provided for session cookies.  */
    expirationDate: Number,
    /** The path of the cookie. */
    path: String,
    /** True if the cookie is marked as HttpOnly (i.e. the cookie is inaccessible to client-side scripts). */
    httpOnly: Boolean,
    /** True if the cookie is marked as Secure (i.e. its scope is limited to secure channels, typically HTTPS). */
    secure: Boolean,
}

var Cookie = new LinvoDB('cookies', cookieSchema)
Promise.promisifyAll(Cookie.find().__proto__);
// const Cookie = mongoose.model('cookies', cookieSchema)

module.exports = Cookie
