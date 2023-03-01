const express = require('express')
const dfff = require('dialogflow-fulfillment')
const app = express();
app.get('/', (req, res) => {
    res.send("it's working")
})
const apartments = [
    {
        id: 1,
        type: "1 bhk",
        status: "available"
    },
    {
        id: 2,
        type: "1 bhk",
        status: "available"
    },
    {
        id: 3,
        type: "2 bhk",
        status: "not available"
    },
]
app.post('/', express.json(), (req, res) => {
    const agent = new dfff.WebhookClient({
        request: req,
        response: res
    })

    function demo(agent) {
        let reqBody = agent?.request_?.body
        let mobile = reqBody?.session.slice(reqBody.session.lastIndexOf('/') + 1)
        let apartment_type = reqBody?.queryResult?.parameters?.room_type
        let budget = reqBody?.queryResult?.parameters?.budget
        const availability = apartments.some((item) => item.type === apartment_type && item.status === "available")
        agent.add(availability ? `We are excited to inform you that ${apartment_type} apartments for ${budget} are available` : 'Currently there are no apartments available')
    }

    let intentMap = new Map()

    intentMap.set('rent_apartment', demo)

    agent.handleRequest(intentMap)
})

app.listen(3333, () => console.log('server running at port 3333'))