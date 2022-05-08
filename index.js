const express = require('express')
const cookieParser = require('cookie-parser')
const path = require('path')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const fs = require('fs')
const http = require('http')
const https = require('https')
const privateKey = fs.readFileSync('sslcert/fredsons.key', 'utf8')
const certificate = fs.readFileSync('sslcert/fredsons.crt', 'utf8')

var credentials = { key: privateKey, cert: certificate };

// Initializations
const app = express()

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(morgan('dev'))

app.use(cookieParser('random'))

app.use(express.json())

app.use(bodyParser.json({ limit: '50mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

// Routes
require('./routes/manager')(app)

app.get('*', (req, res) => {
    res.render('app/404')
});

var httpServer = http.createServer(app)
var httpsServer = https.createServer(credentials, app)

httpServer.listen(process.env.HTTP_PORT || 8080, () => console.log("Server Started At: http://localhost:" + (process.env.HTTP_PORT || 8080)))
httpsServer.listen(process.env.HTTPS_PORT || 8443, () => console.log("Server Secure Started At: https://localhost:" + (process.env.HTTPS_PORT || 8443)))