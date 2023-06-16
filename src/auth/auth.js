const jwt = require('jsonwebtoken');
const User = require('../database/schemas/user')

const auth = async (req, res, next) =>{
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, 'webappprojekt');
      const user = await User.findOne({_id: decoded._id})
      if (user)
      {
        req.token = token
        req.user = user
        next()
      }
      else 
      {
        res.status(401).send('Access forbidden');
      }
    } catch (e) 
    {
      res.status(401).send('Access forbidden');
    }
}


module.exports = auth