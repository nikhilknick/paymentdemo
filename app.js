const express = require('express');
const ejs = require('ejs');
const paypal = require('paypal-rest-sdk');
const port = process.env.PORT || 3000;

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AevznEUVbj1Iga-1_BM6Ypx6ICtCsNbgSGV8NAKvK7hW0Ru5aWECEbrmkfnjLdm19YA7g08SwQcr6zNe',
    'client_secret': 'EMKjpdqweaDpeFVGTN5QFgSnQRS-dz677411YMYZ6_xfISv7vuPAI2u9hsl817aAYtNODfN9wDnaivja'
});

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => res.render('index'));

app.post('/pay', (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3000/success",
            "cancel_url": "http://localhost:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "Red Sox",
                    "sku": "001",
                    "price": "2.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "2.00"
            },
            "description": "Hat for the team"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.redirect(payment.links[i].href);
                }
            }
        }
    });
})

app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "2.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            // console.log("Get Payment Response");
            console.log(JSON.stringify(payment));

            res.send('Success');
        }
    });

})

app.get('/cancel', (req, res) => res.send('Cancelled'));

app.listen(port, () => console.log('server started'));