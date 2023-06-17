const jwt = require("jsonwebtoken");
const { findUserById } = require("../src/queries/userQueries");
require('dotenv').config();
const secret = process.env.JWT_SECRET_KEY;

const createJwtToken = ({ user = null, id = null }) => {
  const jwtToken = jwt.sign(
    {
      sub: id || user._id.toString(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 3,      //token will be active 3 days
    },
    secret
  );
  return jwtToken;
};

const checkExpirationToken = (token, res) => {
  const tokenExp = token.exp;
  const now = Date.now();
  if (now <= tokenExp) {
    return token;
  } else if (now > tokenExp && now - tokenExp < 1000 * 60 * 60 * 24) {
    const refreshedToken = createJwtToken({ id: token.sub });
    res.cookie("jwt", refreshedToken); 
    return jwt.decode(refreshedToken);
  } else {
    throw new Error("token expired");
  }
};

const decodeJwtToken = (token) => {
  return jwt.verify(token, secret);
};

const extractUserFromToken = async (req, res, next) => {    //app.use, for request that send credentials
  const token = req.signedCookies.jwt;
  if (token) {
    try {
      let decodedToken = jwt.verify(token, secret, {
        ignoreExpiration: true,
      });
      decodedToken = checkExpirationToken(decodedToken, res);
      const user = await findUserById(decodedToken.sub);
      if (user) {
        req.user = {  //we store in req.user all the schema of user
          _id: user._id,
          username: user.username,
          avatar: user.avatar,
          followings: user.followings,
          createdAt: user.createdAt 
        }
        next();
      } else {
        res.clearCookie("jwt");     //if no user corresponding to cookie, clear the cookie
        next()
      }
    } catch (e) {
      res.clearCookie("jwt");
      next();
    }
  } else {
    next();     //user is not connected
  }
};

const addJwtFeatures = (req, res, next) => {
  req.isAuthenticated = () => !!req.user;
  req.logout = () => {
    res.clearCookie("jwt");
  }
  req.login = (user) => {
    //send a jwt cookie that will contain the info of the user authenticated.
    //also send a token cookie, encrypted, that will serve to see if the anti-csrf token in form are valids
    const token = createJwtToken({ user });
    if(process.env.NODE_ENV === "development"){
      res.cookie("jwt", token, {httpOnly: true, secure: false, signed: true});    //sign the cookie to prevent modification between time server send cookie and receive it from a request
    }
    else{
      res.cookie("jwt", token, {httpOnly: true, secure: true, sameSite: "none", signed: true});
    }
  };    
  next();
};

exports.createJwtToken = createJwtToken;
exports.decodeJwtToken = decodeJwtToken;
exports.extractUserFromToken = extractUserFromToken;
exports.addJwtFeatures = addJwtFeatures;
