const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')

//   ROUTES
const auth = require('./routes/auth.routes')
const link = require('./routes/link.routes')
const redirect = require('./routes/redirect.routes')

// MODELS

const app = express();

app.use(express.json({ extended: true }))

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000"],
    optionsSuccessStatus: 200
  })
)

app.use('/api/auth', auth)
app.use('/api/link', link)
app.use('/t/', redirect)

if(process.env.NODE_ENV === 'production') {
  app.use('/', express.static(path.join(__dirname, 'client', 'build')))

  app.get('*', (res, req) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
  })
}

const PORT = config.get('port') || 5000

async function start() {
  try {
    await mongoose.connect(config.get('mongoUri'), {
      userNewUrlParser: true,
      userUnifiedTopology: true,
      useCreateIndex: true
    })
  } catch (e) {
    console.log('Server Error', e.message)
  }
}

start()

app.listen(PORT, () => console.log(`App has been started on port: ${PORT}...`))