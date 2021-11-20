'use strict';
const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = (event, context, callback) => {
    console.log("Event: ", event);
    console.log("Slots:", event.currentIntent.slots);
    const slots = event.currentIntent.slots;
    const productName = slots.Name;
    const quantity = slots.Quantity;
    var productDetails = {};

    const sessionAttributes = event.sessionAttributes;
    //sessionAttributes.productName = productName;
    //sessionAttributes.quantity = quantity;

    var param = {
                TableName: 'Product',
                FilterExpression: "ProductName = :var_name",
                ProjectionExpression: "ProductName, Description, Price, Redeem, Terms",
                ExpressionAttributeValues: {
                    ":var_name": productName
                } 
            };
            
    console.log('Attempting to get product details', param);
    
    getProductDetails(param);
    
    function getProductDetails(params){
            dynamoDb.scan(params, function(err, data) {
                if (err) {
                    console.error("Unable to get product details. Error JSON:", JSON.stringify(err));
                } else {
                    console.log("GetItem succeeded:", JSON.stringify(data.Items));
                    console.log("Product details:", data.Items[0].ProductName, data.Items[0].Price, data.Items[0].Description, data.Items[0].Redeem, data.Items[0].Terms);
                    productDetails.price = data.Items[0].Price;
                    productDetails.TotalPrice = data.Items[0].Price*quantity;
                    productDetails.Description = data.Items[0].Description;
                    productDetails.redeem = data.Items[0].Redeem; 
                    productDetails.terms = data.Items[0].Terms;
                }
                setResponse();  
            });
    }
    
    function setResponse(){
    let response = {
        sessionAttributes: {
                "productName": productName,
                "quantity": quantity,
                "totalPrice": productDetails.TotalPrice.toString(),
                "userEmail": sessionAttributes.userEmail
        },
        dialogAction : {
            "type" : "ElicitIntent",
            "message": {
                "contentType": "PlainText",
                //"content": `Details of the product are as follows:\nName: ${productName} \nPrice: ${productDetails.price} \nDescription: ${productDetails.Description} \nHow to Redeem: ${productDetails.redeem} \nTerms & Conditions: ${productDetails.terms} \nContinue placing order for this gift card?`
                "content": "Details of the gift card are as follows:\nName: " + productName + "\nPrice: " + productDetails.price + "\nDescription: " + productDetails.Description + "\nHow to Redeem: " + productDetails.redeem + "\nTerms & Conditions: " + productDetails.terms + "\nContinue placing order for this gift card?"
            }
            //"intentName" : "ReceiverDetailsIntent"
        }
    };
    
    console.log("Response: ", response);
    callback(null, response);
    }
    
};
