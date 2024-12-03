const express = require("express");
const router = express.Router();
const transactionService = require("./transaction.service");
const transaction = ("../db")
const authorizeJWT = require("../middleware/authorizeJWT");
const adminAuthorization = require("../middleware/adminAuthorization");

router.post("/borrow", authorizeJWT, async (req, res) => {
    try {
        const userId = req.userId
        const { itemId, quantityBorrowed } = req.body;
        const newTransaction = await transactionService.borrowItem(userId, itemId, quantityBorrowed);
        res.status(201).json(newTransaction);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.get("/", adminAuthorization, async ( req, res) => {
    try {
        const transactions = await transactionService.getAllTransactions();
        res.send(transactions);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get("/user/:userId", authorizeJWT, async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const transactions = await transactionService.getTransactionsByUserId(userId);
        res.status(200).send(transactions);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

router.get("/transaction/:Id", async ( req, res) => {
    try {
        const transactionId = parseInt(req.params.Id);
        const transactions = await transactionService.getTransactionById(transactionId);
        res.status(200).send(transactions);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.patch("/verify/:transactionId", adminAuthorization, async ( req, res) => {
    try {
        const { transactionId } = req.params;
        const {status} = req.body;
        await transactionService.verifyTransaction(transactionId, status);
        res.status(200).json({message: "Transaction verivy successfully"});
    } catch (error) {
        res.status(400).send(error.message);
    }
});

router.post("/return/:transactionId", authorizeJWT, async (req, res) => {
    try {
        const { transactionId } = req.params;
        const userId = req.userId;

        const transaction = await transactionService.getTransactionById(transactionId);

        if (transaction.userId !== userId) {
            return res.status(403).json({message:"Unauthorized"});
        }

        await transactionService.returnItem(transactionId);
        res.status(200).json({message:"Item Returned"});
        
    } catch (error) {
        res.status(400).send(error.message);
    }
})

module.exports = router;