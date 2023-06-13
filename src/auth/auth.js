const jwt = require('jsonwebtoken');
const User = require('../database/schemas/user')

const auth = async (req, res, next) =>{
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      const user = await User.findOne({_id: decoded._id})
      if (user)
      {
        req.token = token
        req.user = user
        next()
      }
      else 
      {
        req.token = null
        req.user = null
        next()
      }
    } catch (e) 
    {
      req.token = null
      req.user = null
      next()
    }
}


module.exports = auth