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
        status: "not available"
    },
    {
        id: 2,
        type: "1 bhk",
        status: "not available"
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
        const responseText = availability ? `We are excited to inform you that ${apartment_type} apartments for ${budget} are available` 
                            : 'Currently there are no apartments available'
        agent.add(responseText)
    }

    let intentMap = new Map()

    intentMap.set('rent_apartment', demo)

    agent.handleRequest(intentMap)
})

app.listen(3333, () => console.log('server running at port 3333'))






// const dialogflow = require("@google-cloud/dialogflow")
// require('dotenv').config()
// const express = require('express')


// const CREDENTIALS = JSON.parse(process.env.CREDENTIALS)

// const PROJECTID = CREDENTIALS['project_id']

// const CONFIGURATION = {
//     credentials : {
//         private_key: CREDENTIALS['private_key'],
//         client_email: CREDENTIALS['client_email']
//     }
// }

// const sessionClient = new dialogflow.SessionsClient(CONFIGURATION);

// const detectIntent = async (languageCode, queryText, sessionId)=>{
//     let sessionPath = sessionClient.projectAgentSessionPath(PROJECTID, sessionId)

//     let request = {
//         session: sessionPath,
//         queryInput:{
//             text: {
//                 text: queryText,
//                 languageCode:languageCode,
//             }
//         }
//     }

//      const responses = await sessionClient.detectIntent(request)
    
//      const result = responses[0].queryResult;

//      return {
//         response: result.fulfillmentText
//      }
// }


// const webApp = express();

// webApp.use(express.json());

// const PORT = process.env.PORT || 3000;

// webApp.get('/',(req,res)=>{
//     res.send('hello world')
// })

// webApp.post('/dialogflow',async(req,res)=>{
//     const {languageCode,queryText,sessionId} = req.body;

//     let responseData = await detectIntent(languageCode, queryText, sessionId)

//     res.send(responseData.response)
// })

// webApp.listen(PORT,()=>{
//     console.log(`Server is up and running on port ${PORT}`);
// })
