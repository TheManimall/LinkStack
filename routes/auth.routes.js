const { Router } = require('express')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')

const User = require('../models/User')

const router = Router()

// /api/auth
router.post(
  '/register',
  [
    check('email', 'Incorrect email').isEmail(),
    check('password', 'min length of password is 6 signs')
      .isLength({ min: 6 })
  ],
  async (req, res) => {
  try {
    console.log('Data:', req.body)
    const errors = validationResult(req.body)

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Incorrect auth data'
      })
    }

    const { email, password } = req.body
    const candidate = await User.findOne({ email })

    if (candidate) {
      return res.status(400).json({ message: 'User is already exists'})
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = new User({ email, password: hashedPassword })

    await user.save()
    res.status(201).json({ message: 'User is created'})

  } catch (e) {
    res.status(500).json({ message: 'Something is not OK, will try again'})
  }
})

router.post(
  '/login',
  [
    check('email', 'Incorrect email').normalizeEmail().isEmail(),
    check('password', 'min length of password is 6 signs').exists()
  ],
  async (req, res) => {
  try {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        message: 'Incorrect auth data'
      })
    }

    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) return res.status(400).json({ message: 'User is not exists'})

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) return res.status(400).json({ message: 'Incorrect password, pls try again' })

    const token = jwt.sign(
      { userId: user.id },
      config.get('jwtSecret'),
      { expiresIn: '1h'}
    )

    res.json({ token, userId: user.id })

    await user.save()
    res.status(201).json({ message: 'User is created'})
  } catch (e) {

  }
})

module.exports = router