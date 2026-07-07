const express  = require('express');
const { UserAuth } = require('../middleware/UserAuth');
const paymentRoute = express.Router();
const razPayInstance = require("../utils/razPay.js");
const Payment = require('../models/paymentSchema.js');
const memberShipAmount = require('../utils/constants.js');
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils');
const User = require('../models/user.js');


console.log("getting payment route");
paymentRoute.post("/payment/create", UserAuth, async (req,res)=>{
try{
    console.log("Payment Route Hit");
    const {memberShipType} = req.body;
    const {fName, lName, email} = req.user;
    const createOrder = await razPayInstance.orders.create({
        amount: memberShipAmount[memberShipType] * 100,
        currency: "INR",
        receipt: "receipt#1",
        notes: {
            "firstname:": fName,
            "lastname": lName,
            "email": email,
            "membership": memberShipType
        }

    })
    const payment = new Payment({
        userId: req.user._id,
        orderId: createOrder.id,
        status: createOrder.status,
        amount: createOrder.amount,
        currency: createOrder.currency,
        receipt: createOrder.receipt,
        notes: createOrder.notes
    });
    const savePayment = await payment.save();
    res.json({ ...savePayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID });
}
catch(err){
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
}
})

paymentRoute.post("/payment/webhook", async(req,res)=>{
    try{
        const webhookSignature = req.get("X-Razorpay-Signature");
        console.log("Webhook Signature:", webhookSignature);
        const isValidSignature = validateWebhookSignature(JSON.stringify(req.body), webhookSignature, process.env.RAZORPAY_WEBHOOK_SECRET);

        if(!isValidSignature){
            return res.status(400).json({ error: "Invalid Webhook Signature"});
        }

        // Update payment status in DB based on webhook payload

        const paymentDetails = req.body.payload.entity;

        const payment = await Payment.findOne({ orderId: paymentDetails.orderId});
        payment.status = paymentDetails.status;
        
        await payment.save();

        // update the user as premium user if payment is successful
        const user = await User.findOne({ _id: payment.userId});
        user.isPremium = true;
        const membershipType = payment.notes.membership;

        // update the user as premium
        if(req.body.event === "payment.captured" && membershipType){
            console.log("Payment Captured for user:", user._id, "Membership Type:", membershipType);
            user.membershipType = membershipType;
            console.log("User updated as premium:", user);
        }

        if(req.body.event === "payment.failed"){
            user.isPremium = false;
            user.membershipType = null;
        }

        return res.status(200).json({ message: "Payment status updated successfully"});
    }
    catch(err){
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
})

module.exports = paymentRoute;
