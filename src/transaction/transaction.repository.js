const prisma = require("../db");

async function createTransaction(userId, itemId, quantityBorrowed){
    try {
        const newTransaction = await prisma.transaction.create({
            data: {
                userId,
                itemId,
                quantityBorrowed,
                status: "PENDING",
            }
        });
        return newTransaction;
    } catch (error) {
        throw new Error("Failed to create transaction");
    }
}

async function findTransactions() { 
    try {
        const transactions = await prisma.transaction.findMany({
            include: {
                item: {
                    select: {
                        name: true,
                    }
                }
            }
        });
        return transactions;
    } catch (error) {
        throw new Error("Failed to fetch transactions");
    }
}

async function findTransactionsByUserId(userId) {
    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: parseInt(userId)
            },
            include: {
                item: {
                    select: {
                        name: true,
                    }
                }
            }
        });
        return transactions;
    } catch (error) {
        throw new Error("failed to fetch transactions by User ID");
    }
    
}

async function findTransactionById(Id) {
    const transaction = await prisma.transaction.findUnique({
        where: {
            id: parseInt(Id),
        }
    });
    return transaction;
}

async function updateTransactionStatus(transactionId, status, TimeStampField) {
    try {
        const updateData = {
            status,
        }

        if(TimeStampField) {
            updateData[TimeStampField] = new Date();
        }

        await prisma.transaction.update({
            where:{
                id: parseInt (transactionId),
            },
            data: updateData,
        });
    } catch (error) {
        throw new Error("Failed to Update Transaction Status");
        
    }
}

module.exports = {
    createTransaction,
    findTransactions,
    findTransactionsByUserId,
    findTransactionById,
    updateTransactionStatus
}