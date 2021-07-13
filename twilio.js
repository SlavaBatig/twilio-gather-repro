const twilio = require('twilio'),
   express = require('express'),
   WS = require('ws'),
   http = require('http')

const VoiceResponse = twilio.twiml.VoiceResponse

const { HOST, SID, TOKEN, PORT } = process.env

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const sendBeep = (ws, data) => {
   ws.send(JSON.stringify({
      event: 'media',
      streamSid: data.start.streamSid,
      media: {
         payload: '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ZmtvbGRdXWfz3NbX3vRsZ2pubmdfXWN94djW3OxyZ2htb2phXV9x6NnX2uZ8amhsb2xkXl9r793X2eH4bWlrb21nX15n+uDZ2N7ucWlqbm9pYl9kd+bb2N3peWtpbW5sZF9ibuzd2dvk+21qbG9tZ2Fha/Xg2trh8XBqbG5uaWNhZ37m3Nre7Hhsa25ua2ViZXPr3tvd6P5ua21ubWdjZG7y4dvc5PZxa21ubmlkY2v85d3c4e53bWxub2tmZGh669/c3+t+bmxubmxoZGZy7+Hd3uf4cmxtb25qZWZu+Obe3eTxdm1sbm9rZ2Zrfurf3uLtfW9tbm5taGZpdu7i3uDq+3JtbW9uamdocPXm39/n9HZubW5ua2lobfzp4d/k73xwbW5vbWloa3vt49/i7P1ybm5vbmpoanTy5uDh6vd1b25vbmtpanD66eLh5/F6cG5vb2xraW5+7eTh5e3+c25vb21ramx48Ofi5Ov5dm9vb29samx09+nj4+n1enFvb29ta2tv/ezl4+fvfnNvb29ta2tufO/n5Obt+3Vvb3BvbWttd/Xq5ebr9nlxcHBvbmxtc/vs5uXp8n1zcHBvbm1scX7v6Obo7/x2cHBwb21sb3rz6ubn7fh4cnBwb21tbnb57efn6/R8dHFwb29tbXP97+nn6vH/dnFxcG9tbXF98uro6e/6eHNxcXBubnB59+3o6O33e3RxcXBubm92++/q6ezz/3ZycnFwbm5zf/Hr6evv/HlzcnFwb25ye/bt6eru+Xt0c3Jxb29xePru6urt9n53cnJycG9wdv3y6+rs8v15c3JycG9wdH317evr8Pp6dXNycXBwc3r47uzr7/d9d3RzcnFwcnj88u3r7vT+eXRzcnFwcXZ/9O3s7fL7enV0c3JxcXV8+O/t7PD4fHd0c3NxcXR6+/Ht7O/2/3h0dHNycXN4/vTu7e70/Xl2dHNzcnJ2fvfv7e3y+nx2dHRzcnJ1e/ny7e3w+H54dnR0c3J0efz07u7v9v56dnV0c3N0eP/28O7v9Pt7d3V0dHNzd3358u7u8vl+eHZ1dHNzdnv79O/u8ff+end1dHRzdXn/9vDv8PX8e3h1dXV0dXh++PLw7/T6fXh2dXV0dHd8+/Tw7/L5/np3dXV0dHZ7/fbx8PL3/Xt4dnV1dXZ5//jz8PH2/Hx4d3Z1dXZ4ffr08PD0+n55eHZ2dXV4fPz28fDz+P57d3d2dXV3e/748/Hy9/x8eXd2dnV2en769PLy9ft+enh3dnZ2eX379vLy9fn+e3h3dnV2eHz9+PTy9Pj9fHh4dnZ2d3v/+fXz8/f8fXp4d3Z2d3p9+/bz8/b6/3t5d3d3d3l9/Pj09PX5/nx6eHd2d3h7/vn28/T4/X16eHd3d3h7fvv29PT3+/97eXh3d3h6ffz49PT2+v98eXh4eHh5fP359vT1+f19enh3d3h5e//69/X1+Px+e3l4d3d4en789/b19/v/fHp4d3d4en38+Pf19vr+fXp5eHh4eXz++vf29vn9fnt5eHh4eXt/+/j29vj8/3t6eXh4eXt+/Pn39/j6/n16eXl4eXp9/vr39vf6/X17eXl4eXp8f/v49/f5/H58enl5eXl7fvz5+Pf4+/98enl5eXl6ff36+Pf4+v59e3l5eXl6fP77+fj4+v1+fHp5eXl6fH/8+fj4+fz+fHp5eXp6e379+vj3+Pv+fXt6eXl5e33++/n4+Pr9fnx6enl6e3z//Pr4+Pr8fn17enp6enx+/fr5+Pn8/317enl5ent+/fz5+Pn7/X58enp6ent9/vz6+Pn6/H58e3p6ent8f/37+fn6/P99e3p6ent8ff77+vn6+/59fHt6ent8ff78+vn5+/1+fHt6enp7fH79+/n5+/1+fXt6enp7fH79+/r5+vz/fnx7enp7fH3+/Pv6+vz+fnx7e3p7e33//fv6+vv9f317e3p7e31+/fz6+vv9f317e3p7e3x+/vz7+vv8/n18e3t7e3x9/v37+vv8/X59e3t7e3x9//38+vr7/X99fHt7ent8fv78+/v7/P5+fHt7e3x9fv79+/v7/P5+fXx7e3x8fv79/Pv7/P1+fXx7e3t8fX7+/Pv7/P3+fnx8e3t8fX7+/Pv7+/z+fn18e3t8fH7+/fz8+/z+fn18e3t8fH3//fz7+/z9f319fHt7fH1+/v38+/z9/n59fHt7fH1+/v38+/z8/n59fHx8fHx9fv78/Pz8/X99fHx7e3x9fv79/Pz8/X9+fXx8fHx9fv79/Pz8/f5+fXx8e3x8fv79/Pz8/P5/fn18fHx9ff/+/fz8/P5/fn18fHx9fX7+/fz8/P1/fn18fHx9fX7+/fz8/P3+fn18fHx8fX5+/v38/P3+f359fXx8fH3//v38/Pz9/359fXx8fH1+/v39/Pz9/n59fX18fX1+//79/Pz9/n59fX18fX19//79/fz9/n9+fX18fX1+//79/f39/f5+fX19fX19fv7+/f39/f7/fn19fHx9fv7+/f39/f7/fn19fXx9fn7//v39/f3+fn19fX19fn7//v39/f3+/359fX19fX7//v39/f3+fn59fX19fX7//v79/f3+fn59fX19fX5+/v79/f39/n5+fX19fX7///79/f39/n5+fX19fX1+//79/f3+/n9+fX19fX1+//7+/f39/v9+fX19fX1+//7+/f39/v5+fn19fX19fn7+/f39/v5+fn19fX1+fv/+/v39/v5/f359fX19fn7+/v39/f7/fn59fX19fn7//v79/f3+fn59fX19fn7//v39/f7+f35+fX19fX5+/v79/f7+/35+fX19fX5+//7+/f7+/v9+fn19fn5+//7+/v7+/v9+fn19fX5+//7+/v7+/v9+fn19fX1+///+/v7+/v5+fn59fX1+fv/+/v79/v7/fn59fX1+fv/+/v79/v7/fn59fX1+fn7//v79/f7/fn5+fn5+fv/+/v7+/v7+/35+fX1+fn7//v7+/v7+fn5+fn5+fn7//v7+/f7+/35+fX19fn5+/v7+/f3+/n5+fn59fX5+/v7+/v7+/v9+fn1+fn5+//7+/v7+/v9+fn5+fn5+//7+/v7+/v9+fn5+fn5+fv/+/v7+/v//fn5+fX5+fv/+/f3+/v7/fn5+fn5+fn7//v7+/v//fn5+fn5+fv/+/v7+/v7/fn5+fn5+fn7//v7+/v7///9+fn5+fn7///7+/v7/fv9+fn5+fn7//v7+/v7+/35+fn5+fn5+/////v7//35+fn59fX5+///+/v7///9+fn5+fn5+///+/v7+/v//fn5+fn5+///+/v7+/v//fn5+fn5+fv/+/v7+/v//fn5+fn5+fv///v7+/v7//35+fn5+fv///v7+/v///35+fn5+fv////7+/v7//35+fn5+fv///v7+/v7+/35+fn5+fn7///7+/v7+/35+fg=='
      }
   }))
}

const sendGather = data => {
   const { callSid } = data.start

   console.log('sending gather for call', callSid, SID, TOKEN)

   const twilioInstance = twilio(SID, TOKEN)

   const response = new VoiceResponse()

   response.gather({
      action: `https://${HOST}/call`,
      method: 'POST',
      input: 'dtmf',
      timeout: '3'
   })

   const call = twilioInstance.calls(callSid)

   call.update({ twiml: response.toString() })
      .catch(err => console.error('Failed updating call', err))
}

const wsHandler = server => {
   const wss = new WS.Server({
      server
   })

   wss.on('connection', ws => {
      console.log('new connection')

      ws.on('message', async message => {
         const data = JSON.parse(message)

         if (data.event === 'start') {
            console.log('stream started', data)
            sendBeep(ws, data)
            sendGather(data)
         }
      })
   })

   wss.on('close', () => {
      console.log('connection closed')
   })
}

app.post('/call', (req, res) => {
   console.log('new call', req.body)

   const response = new VoiceResponse()

   const connect = response.connect()

   connect.stream({
      name: 'Voice Stream Sync',
      url: `wss://${HOST}/ws`
   })

   res.send(response.toString())
})

const server = http.createServer(app)

wsHandler(server)

server.listen(PORT || '3000', () => {
   console.info('listening at', PORT || 3000)
})