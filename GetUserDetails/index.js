'use strict';
const AWS = require('aws-sdk');
const uuid = require('uuid');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    console.log("Event: ", event);
    console.log("Slots:", event.currentIntent.slots);
    const slots = event.currentIntent.slots;
    const userName = slots.Username;
    const userEmail = slots.UserEmail;
    const userPhoneNumber = slots.UserPhoneNumber;
    let productName = '';
    const sessionAttributes = event.sessionAttributes;
    //sessionAttributes.userName = userName;
    //sessionAttributes.userEmail = userEmail;

    var param = {
                TableName: 'Product',
                ProjectionExpression: "ProductName"
            };
            
    console.log('Attempting to get user details', param);
    
    getProductDetails(param);
    
    function getProductDetails(params){
            dynamoDb.scan(params, function(err, data) {
                if (err) {
                    console.error("Unable to get product details. Error JSON:", JSON.stringify(err));
                } else {
                    console.log("GetItem succeeded:", JSON.stringify(data.Items));
                    data.Items.forEach(function(item) {
                        console.log("Gift Card: %s", item.ProductName);
                        const products = item.ProductName;
                        productName = productName.concat(" ",products,",");
                    });
                    console.log("Available Gift Cards:",JSON.stringify(productName));
                }
                putDetails();
            });      
    }

    function putDetails(){
        var params = {
            TableName: 'User',
            Item: {
                'UserID' : uuid.v1(),
                'UserEmail' : userEmail,
                'UserName' : userName,
                'UserPhoneNumber' : userPhoneNumber,
            }
        };
        console.log("Params User Table: ",params);
        dynamoDb.put(params, function(err, data) {
            if (err) {
                console.log("Error", err);
            } else {
                console.log("Successfully stored user details in the User table.", data);
            }         
        });
        setResponse();
    }
    
    function setResponse(){
    let response = {
        sessionAttributes: {
                "userEmail": userEmail
        },
        dialogAction : {
            "type" : "ElicitSlot",
            "message": {
                "contentType": "PlainText",
                "content": `Hi ${userName}! Welcome to Gift Card, Currently available gift cards are${productName}. Which one would you like to buy?`
            },
            "intentName" : "OrderDetailsIntent",
            "slots" : {
                "Name" : "Titan",
                "Quantity" : 1
            },
            "slotToElicit" : "Name"
        }
    };
    
    console.log("Response: ", response);
    callback(null, response);
    }
    
};