const express = require('express')
const app = express()
const port = 80

app.post('/', (req, res) => {
    console.log('received email ' + JSON.parse(req.body).subject)
    res.send('Hello World!')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
