const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 80

// parse application/json
app.use(bodyParser.json())
app.post('/', (req, res) => {
    console.log('received email ' + req.body.subject)
    res.send('Hello World!')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
