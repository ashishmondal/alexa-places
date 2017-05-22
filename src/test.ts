import { handler } from './index';
import { IEvent, IContext } from './skill/alexaskill'

var context : IContext = {
    "awsRequestId": "e5e9a3a8-72a6-11e5-81db-8147b73c0b42",
    "invokeid": "e5e9a3a8-72a6-11e5-81db-8147b73c0b42",
    "logGroupName": "/aws/lambda/places",
    "logStreamName": "2015/10/14/[$LATEST]7862672df7ba48b2978e576c680df215",
    "functionName": "places",
    "memoryLimitInMB": "128",
    "functionVersion": "$LATEST",
    "invokedFunctionArn": "arn:aws:lambda:us-east-1:679426061051:function:places",
    succeed: function(x) {
        console.log('Success: ' + JSON.stringify(x));
    },
    fail: function(x) {
        console.log('Failed: ' + JSON.stringify(x));
    }
};

var event : IEvent = {
    "session": {
        "sessionId": "SessionId.16f02458-f90d-4c2d-b413-1e9474f65060",
        "application": {
            "applicationId": "amzn1.echo-sdk-ams.app.15ac5944-2adb-461a-bb4c-eb0c7d2cf7f3"
        },
        "attributes": null,
        "user": {
            "userId": "amzn1.account.AGISIZJOPWDNTCIKLN5MN4YNGVHQ",
            "accessToken": null
        },
        "new": true
    },
    "request": {
        "type": "IntentRequest",
        "requestId": "EdwRequestId.5b5e8bd2-c5de-4291-a281-0c917098857e",
        "timestamp": 1444765910813,
        "intent": {
            "name": "IsPlaceOpenNow",
            "slots": {
                "Place": {
                    "name": "Place",
                    "value": "costco"
                }
            }
        },
        "reason": null
    }
};

handler(event, context);