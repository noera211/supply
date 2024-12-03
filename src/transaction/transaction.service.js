const transactionRepository = require("./transaction.repository");
const itemRepository = require("../item/item.repository");
const { TransactionStatus } = require("@prisma/client");

async function borrowItem(userId, itemId, quantityBorrowed) {
    const newTransaction = await transactionRepository.createTransaction(userId, itemId, quantityBorrowed);
    return newTransaction;
}

async function getAllTransactions() {
    const transactions = await transactionRepository.findTransactions();
    return transactions;
}

async function getTransactionsByUserId(userId) {
    const transactions = await transactionRepository.findTransactionsByUserId(userId);
    return transactions;
}

async function getTransactionById(Id) {
    const transaction = await transactionRepository.findTransactionById(Id);
    return transaction;
}

async function verifyTransaction(transactionId, status) {
    const transaction = await transactionRepository.findTransactionById(transactionId);
    if(!transaction){
        throw new Error("Transaction not found.");
    }

    await transactionRepository.updateTransactionStatus(transactionId, status, status === "BORROWED" ? "borrowedAt" : null);

    if (status === "BORROWED") {
        const item = await itemRepository.findItemById(transaction.itemId);
        if(!item) {
            throw new Error("item not found.");
        }

        const newQuantity = item.quantity - transaction.quantityBorrowed;
        if(newQuantity < 0) {
            throw new Error("Out off Stock.");
        }

        await itemRepository.updateItemQuantity(item.id, newQuantity);
    }
}

async function returnItem(transactionId) {
    const transaction = await transactionRepository.findTransactionById(transactionId);

    if (!transaction) {
        throw new Error("Transaction not found.");    
    }

    if (transaction.status !== "BORROWED") {
        throw new Error("cannot return item. Transaction status is not Borrowed");
    }

    await transactionRepository.updateTransactionStatus(transactionId, "RETURNED", "returnedAt");
    const item = await itemRepository.findItemById(transaction.itemId);
    const newQuantity = item.quantity + transaction.quantityBorrowed;
    await itemRepository.updateItemQuantity(item.id , newQuantity);
    
}
module.exports = {
    borrowItem,
    getAllTransactions,
    getTransactionById,
    getTransactionsByUserId,
    verifyTransaction,
    returnItem
}