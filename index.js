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
        let reqBody = agent.request_.body
        console.log(reqBody.queryResult.parameters.room_type,agent.request_.body.queryResult.parameters.budget)
        let mobile = reqBody.session.slice(reqBody.session.lastIndexOf('/'))
        console.log(mobile)
        agent.add("Sending response from webhook server")
    }
    
    let intentMap = new Map()

    intentMap.set('rent_apartment',demo)

    agent.handleRequest(intentMap)
})

app.listen(3333, () => console.log('server running at port 3333'))