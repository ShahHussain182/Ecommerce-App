import { oneHourFromNow, thirtyDaysFromNow } from "./date.js";

const defaults = {
    sameSite:"strict",
    httpOnly : true,
    secure : process.env.NODE_ENV === "production",
};
const getAccessTokenCookieOptions = () => ({
       ...defaults,
       expires : oneHourFromNow()
});
const getRefreshTokenCookieOptions = () => ({
    ...defaults,
    expires : thirtyDaysFromNow(),
    
})

export const setCookies = (res , token,name) => {
    let options;
    if (name === "AccessToken") {
      options = getAccessTokenCookieOptions();
    } else if (name === "RefreshToken") {
      options = getRefreshTokenCookieOptions();
    }
    
    
    res.cookie(name,token,options)


};
