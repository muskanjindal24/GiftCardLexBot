var aws = require("aws-sdk");
var ses = new aws.SES({ region: "us-east-1" });

exports.handler = async (event, context, callback) => {
    var ValidProducts = {};    
    console.log("Event: ",event);
       
            
    event.Records.forEach((record) => {
        console.log('Stream record: ', JSON.stringify(record, null, 2));
        if (record.eventName == 'INSERT') {
            ValidProducts.email = record.dynamodb.NewImage['ReceiverEmail']['S'];
            ValidProducts.phone_number = record.dynamodb.NewImage['ReceiverPhoneNumber']['S'];
            ValidProducts.name = record.dynamodb.NewImage['ReceiverName']['S'];
            ValidProducts.product_name = record.dynamodb.NewImage['ProductName']['S'];
            ValidProducts.quantity = record.dynamodb.NewImage['Quantity']['S'];
            ValidProducts.total_price = record.dynamodb.NewImage['TotalPrice']['S'];
            ValidProducts.address = record.dynamodb.NewImage['UserEmail']['S'];
            ValidProducts.message = record.dynamodb.NewImage['Message']['S'];
            ValidProducts.giftcard = record.dynamodb.NewImage['GiftCardID']['S'];
            console.log("Retrieved Product Details on Insert: ",ValidProducts);
        }

    });
    
    function sendPaymentEmail(){
                    var params = {
            Destination: {
                ToAddresses: [ValidProducts.address],
            },
            Message: {
                Body: {
                    Text: { Data: "Hello " + " your order with details as below is confirmed.\n" + "Product Name: " + ValidProducts.product_name + "\nQuantity " + 
                    ValidProducts.quantity + "\nTotal Price: " + ValidProducts.total_price + "\nYour GiftCardID is: " + ValidProducts.giftcard  },
                //    Text: {Data: "Your orders with following details is registered. Complete the payment using following and place the order"},
                },

            Subject: { Data: "Payment Details for " + ValidProducts.product_name},
            //Subject: { Data: "Payment Details for Demo"},
            },
            Source: "SourceEmailId",
            };
            
            console.log("Payment Message Format: ",params);
            var sendPromise = ses.sendEmail(params).promise();
            sendPromise.then(
            function(data) {
                console.log("Payment Email Success: ",data.MessageId);
            }).catch(
                function(err) {
                    console.error(err, err.stack);
            });

    }
    
    function sendGiftSMS(){
        var params = {
            Message: "Hello " +  ValidProducts.name + " a giftcard is sent to you.\n" + "Product Name: " + ValidProducts.product_name + "\nQuantity " + 
                    ValidProducts.quantity + "\nYour GiftCardID is: " + ValidProducts.giftcard + "Message for you with this giftcard is " + ValidProducts.message, 
            //Message: "Your orders with following details is registered. Complete the payment using following and place the order",
            PhoneNumber: '+91'+ValidProducts.phone_number,   
        };
        console.log("Payment Params SMS: ",params);

// Create promise and SNS service object
        var publishTextPromise = new aws.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

// Handle promise's fulfilled/rejected states
publishTextPromise.then(
  function(data) {
    console.log("Payment MessageID is " + data.MessageId);
  }).catch(
    function(err) {
    console.error(err, err.stack);
  });
    }
    
    function sendGiftEmail(){
                    var params = {
            Destination: {
                ToAddresses: [ValidProducts.email],
            },
            Message: {
                Body: {
                    Text: { Data: "Hello " +  ValidProducts.name + " a giftcard is sent to you.\n" + "Product Name: " + ValidProducts.product_name + "\nQuantity " + 
                    ValidProducts.quantity + "\nYour GiftCardID is: " + ValidProducts.giftcard + "\nMessage for you with this giftcard is " + ValidProducts.message },
                //    Text: {Data: "Hello your order with below details is confirmed"},
                },

            Subject: { Data: "Gift Card for " + ValidProducts.product_name},
            //Subject: { Data: "Order Confirmation for Demo"},
            },
            Source: "YourEmail",
            };
            
            console.log("Confirmation Message Format: ",params);
            var sendPromise = ses.sendEmail(params).promise();
            sendPromise.then(
            function(data) {
                console.log("Gift Email Success: ",data.MessageId);
            }).catch(
                function(err) {
                    console.error(err, err.stack);
            });

    }
    
    function sendConfirmationSMS(){
        var params = {
            Message: "Hello " +  ValidProducts.name + " your order with details as below is confirmed.\n" + "Product Name: " + ValidProducts.product_name + "\nQuantity " + 
                    ValidProducts.quantity + "\nTotal price: Rs." + ValidProducts.total_price + "\nAddress: " + ValidProducts.address + "\nMobile Number: " + 
                    ValidProducts.phone_number, /* required */
           //Message: "Order Confirmed Demo",
           PhoneNumber: '+91'+ValidProducts.phone_number,
        };
        console.log("Confirmation Params SMS: ",params);

// Create promise and SNS service object
        var publishTextPromise = new aws.SNS({apiVersion: '2010-03-31'}).publish(params).promise();

// Handle promise's fulfilled/rejected states
publishTextPromise.then(
  function(data) {
    console.log("Confirmation MessageID is " + data.MessageId);
  }).catch(
    function(err) {
    console.error(err, err.stack);
  });
    }
    callback(null, 'message');
};