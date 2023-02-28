const express = require('express')
const dfff = require('dialogflow-fulfillment')
const app = express();
app.get('/', (req, res) => {
    res.send("it's working")
})

app.post('/',express.json(), (req, res) => {
    const agent = new dfff.WebhookClient({
        request: req,
        response: res
    })

    function demo(agent){
        console.log(agent)
        agent.add("Sending response from webhook server")
    }
    
    let intentMap = new Map()

    intentMap.set('rent_apartment',demo)

    agent.handleRequest(intentMap)
})

app.listen(3333, () => console.log('server running at port 3333'))