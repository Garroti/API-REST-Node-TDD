const jwt = require('jwt-simple')
const bcrypt = require('bcrypt-nodejs')
const variables = require('../config/variables')
const ValidationError = require('../errors/ValidationError')

module.exports = (app) => {
    const signin = (req, res, next) => {
        app.services.user.find({mail:req.body.mail})
            .then((user) => {
                if(!user) throw new ValidationError('Usuario ou senha invalida')
                if(bcrypt.compareSync(req.body.password, user.password)){
                    const payload = {
                        id: user.id,
                        name: user.name,
                        mail: user.mail
                    }
                    const token = jwt.encode(payload, variables.Security.secretKey)
                    res.status(200).json({token})
                } else throw new ValidationError('Usuario ou senha invalida')
            })
            .catch(err => next(err))
    }

    return { signin }
}