const twilio = require('twilio'),
   express = require('express'),
   http = require('http')

const VoiceResponse = twilio.twiml.VoiceResponse

const { PORT } = process.env

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.post('/call', (req, res) => {
   console.log('new call', req.body)

   const response = new VoiceResponse()

   response.say('hello')
   const gather = response.gather({
    speechTimeout: 5, // seconds bot will listen
    input: 'dtmf speech', // bot will listen to both speech and dtmf (numbers)
    finishOnKey: '#', // if # is pressed sequence will be sent to the bot immediately,
    timeout: 5, // seconds bot will listen to dtmfs (amount of type you can type the numbers)
    actionOnEmptyResult: true // will send a webhook call even if nothing was said/entered
   })

   gather.say('say something to continue')

   res.set('Content-Type', 'text/xml')

   res.send(response.toString())
})

const server = http.createServer(app)

server.listen(PORT || '3000', () => {
   console.info('listening at', PORT || 3000)
})