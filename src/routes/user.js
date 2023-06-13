const express = require('express')
const User = require('../database/schemas/user.js')
const jwt = require('jsonwebtoken');
const auth = require('../auth/auth.js');


const UserRoute = new express.Router()

UserRoute.post('/api/user', async (req, res)=>{
      try {
            const user = new User(req.body)
            await user.save()
            const token = await user.makeUserAuthToken()
            res.status(201).send({user, token})
      } catch (error) {
            res.status(406).send({ error: error.message})
      }
  })
  
UserRoute.post('/api/user/login', async (req, res) =>{
      try {
          const user = await User.findUser(req.body.email, req.body.password)
          const token = await user.makeUserAuthToken();
          return res.send({user, token})
      } catch (error) {
          return res.status(406).send({ error: error.message})
      }
})

UserRoute.post('/api/user/login', async (req, res) =>{
      try {
          const user = await User.findByCredentials(req.body.email, req.body.password)
          const token = await user.generateAuthToken()
          res.send({user, token})
      } catch (error) {
          res.status(406).send({ error: error.message})
      }
  })
  
  
// treba dodati auth funkciju
UserRoute.get('/api/user/me', async (req, res) =>{
      res.send(req.user)
})

UserRoute.post('/api/token/valid', async (req, res) => {
      try {
            let valid = false;
            if(req.body.token) valid = !!jwt.verify(req.body.token, process.env.TOKEN_KEY);
            res.send(valid)
      } catch (error) {
            res.send(false);
      }
})

module.exports = UserRoute

  