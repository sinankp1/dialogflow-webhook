const express = require('express');
const dfff = require('dialogflow-fulfillment');
const app = express();
const axios = require('axios');
const dialogflow = require('@google-cloud/dialogflow');
const PORT = process.env.PORT || 3000;
require('dotenv').config();

const apartments = [
    {
        id: 1,
        type: '1 bhk',
        status: 'not available',
    },
    {
        id: 2,
        type: '1 bhk',
        status: 'not available',
    },
    {
        id: 3,
        type: '2 bhk',
        status: 'not available',
    },
];

const CREDENTIALS = JSON.parse(process.env.CREDENTIALS);
const WEBHOOK = JSON.parse(process.env.WEBHOOK);

const PROJECTID = CREDENTIALS['project_id'];

const CONFIGURATION = {
    credentials: {
        private_key: CREDENTIALS['private_key'],
        client_email: CREDENTIALS['client_email'],
    },
};

const sessionClient = new dialogflow.SessionsClient(CONFIGURATION);

const detectIntent = async (languageCode, queryText, sessionId) => {
    let sessionPath = sessionClient.projectAgentSessionPath(PROJECTID, sessionId);

    let request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: queryText,
                languageCode: languageCode,
            },
        },
    };

    const responses = await sessionClient.detectIntent(request);

    const result = responses[0].queryResult;

    return {
        response: result.fulfillmentText,
    };
};

app.use(express.json())

app.get('/', (req, res) => {
    res.send("it's working");
});

app.post('/', (req, res) => {
    const agent = new dfff.WebhookClient({
        request: req,
        response: res,
    });

    function demo(agent) {
        let reqBody = agent?.request_?.body;
        let mobile = reqBody?.session.slice(reqBody.session.lastIndexOf('/') + 1);
        let apartment_type = reqBody?.queryResult?.parameters?.room_type;
        let budget = reqBody?.queryResult?.parameters?.budget;
        const availability = apartments.some(
            (item) => item.type === apartment_type && item.status === 'available',
        );
        const responseText = availability
            ? `We are excited to inform you that ${apartment_type} apartments for ${budget} are available`
            : 'Currently there are no apartments available';
        agent.add(responseText);
    }

    let intentMap = new Map();

    intentMap.set('rent_apartment', demo);

    agent.handleRequest(intentMap);
});

app.post('/dialogflow', async (req, res) => {
    const { languageCode, queryText, sessionId } = req.body;

    let responseData = await detectIntent(languageCode, queryText, sessionId);

    res.send(responseData.response);
});

app.get('/webhook', (req, res) => {
    const response = req.query['hub.challenge'] || 'Invalid challenge value';
    res.send(response);
});

const callDialogFlow = async (queryText, sessionId) => {
    try {
        const { data } = await axios.post(
            'https://tan-powerful-hummingbird.cyclic.app/dialogflow',
            {
                languageCode: 'en',
                queryText,
                sessionId,
            },
        );
        return data;
    } catch (err) {
        console.log('Third error');
        console.log(err);
    }
};

const sendMessage = async (to, message) => {
    try {
        const phoneNumberId = WEBHOOK['phoneNumberId'];
        const version = WEBHOOK['version'];
        const bearerToken = WEBHOOK['accessToken'];

        const { data } = await axios.post(
            `https://graph.facebook.com/${version}/${phoneNumberId}/messages`,
            {
                messaging_product: 'whatsapp',
                to,
                type: 'text',
                text: {
                    body: message,
                },
            },
            {
                "headers": {
                    "Authorization": `${bearerToken}`,
                },
            },
        );
        return data;
    } catch (err) {
        console.log('first error');
        console.log(err?.response || err, 'ffff');
    }
};

app.post('/webhook', async (req, res) => {
    try {
        console.log(JSON.stringify(req.body), "/webhook error")
        if (req.body?.entry[0]?.changes[0]?.value?.messages && req.body?.entry[0]?.changes[0]?.value?.messages[0]) {
            const { from, text } = req.body?.entry[0]?.changes[0]?.value?.messages[0];
            console.log(from ,text, "/webhook error")
            const { body } = text;
            const responseMessage = await callDialogFlow(body, from);
            const send = await sendMessage(from, responseMessage);
            res.send(send);
        }
        res.send("there was no from or text")
    } catch (err) {
        console.log('Second error');
        console.log(err, 'ssss');
        res.send(err);
    }
});

app.listen(PORT, () => console.log('server running at port ', PORT));
