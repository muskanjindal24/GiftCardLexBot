'use strict';
const AWS = require('aws-sdk');
const uuid = require('uuid');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    console.log("Event: ", event);
    console.log("Slots:", event.currentIntent.slots);
    const slots = event.currentIntent.slots;
    const ReceiverName = slots.ReceiverName;
    const ReceiverEmail = slots.ReceiverEmail;
    const ReceiverPhoneNumber = slots.ReceiverPhoneNumber;
    const customMsg = slots.Message;
    const deliveryMode = slots.DeliverMode;
    const sessionAttributes = event.sessionAttributes;

    function putDetails(){
        var params = {
            TableName: 'OrderTable',
            Item: {
                'OrderId' : uuid.v4(),
                'DeliveryMode' : deliveryMode,
                'GiftCardID' : uuid.v4(),
                'Message' : customMsg,
                'ProductName' : sessionAttributes.productName,
                'Quantity' : sessionAttributes.quantity,
                'TotalPrice' : sessionAttributes.totalPrice,
                'ReceiverEmail' : ReceiverEmail,
                'ReceiverName' : ReceiverName,
                'ReceiverPhoneNumber' : ReceiverPhoneNumber,
                'UserEmail' : sessionAttributes.userEmail
            }
        };
        console.log("Params Order Table: ",params);
        dynamoDb.put(params, function(err, data) {
            if (err) {
                console.log("Error", err);
            } else {
                console.log("Successfully stored receiver details in the Order table.", data);
            }         
        });
        setResponse();
    }
    
    putDetails();
    
    function setResponse(){
    let response = {

        dialogAction: {
        "type" : "ConfirmIntent",
        "message": {
        "contentType": "PlainText",
        "content": "Your Order details have been registered"
    },
     "intentName": "ReceiverDetailsIntent"
      }
    };
    
    console.log("Response: ", response);
    callback(null, response);
    }
    
};