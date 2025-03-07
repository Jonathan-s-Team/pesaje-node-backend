const dbAdapter = require('../adapters');
const PurchaseStatusEnum = require('../enums/purchase-status.enum');

const createPaymentMethod = async (data) => {
    const transaction = await dbAdapter.purchasePaymentMethodAdapter.startTransaction();
    try {
        // Validate purchase exists
        const purchase = await dbAdapter.purchaseAdapter.getById(data.purchase);
        if (!purchase) {
            throw new Error('Purchase does not exist');
        }

        // Validate payment method exists
        const paymentMethod = await dbAdapter.paymentMethodAdapter.getById(data.paymentMethod);
        if (!paymentMethod) {
            throw new Error('Payment Method does not exist');
        }

        // Get all existing payments for this purchase
        const existingPayments = await dbAdapter.purchasePaymentMethodAdapter.getAll({ purchase: data.purchase });

        // Calculate total paid amount including this new payment
        const totalPaid = existingPayments.reduce((sum, pm) => sum + pm.amount, 0) + data.amount;

        // Ensure total does not exceed `totalAgreedToPay`
        if (totalPaid > purchase.totalAgreedToPay) {
            throw new Error(`Total payments cannot exceed the total agreed amount of ${purchase.totalAgreedToPay}`);
        }

        // Create new payment entry
        const newPayment = await dbAdapter.purchasePaymentMethodAdapter.create(data, { session: transaction.session });

        // Determine new purchase status
        let newStatus;
        if (totalPaid >= purchase.totalAgreedToPay) {
            newStatus = PurchaseStatusEnum.READY_FOR_CONFIRMATION;
        } else if (existingPayments.length === 0 && data.amount < purchase.totalAgreedToPay) {
            newStatus = PurchaseStatusEnum.IN_PROGRESS;
        } else {
            newStatus = PurchaseStatusEnum.IN_PROGRESS;
        }

        // Update purchase status if necessary
        if (purchase.status !== newStatus) {
            await dbAdapter.purchaseAdapter.update(purchase.id, { status: newStatus }, { session: transaction.session });
        }

        await transaction.commit();
        return newPayment;
    } catch (error) {
        await transaction.rollback();
        throw new Error(error.message);
    } finally {
        await transaction.end();
    }
};

const getPaymentsByPurchase = async (purchaseId) => {
    const query = purchaseId ? { purchase: purchaseId } : {};
    return await dbAdapter.purchasePaymentMethodAdapter.getAll(query);
};

const removePaymentMethod = async (id) => {
    const transaction = await dbAdapter.purchasePaymentMethodAdapter.startTransaction();
    try {
        // Find the payment method
        const payment = await dbAdapter.purchasePaymentMethodAdapter.getById(id);
        if (!payment) {
            throw new Error('Payment method not found');
        }

        // Soft delete the payment
        await dbAdapter.purchasePaymentMethodAdapter.update(id, { deletedAt: new Date() }, { session: transaction.session });

        // Get all remaining active payments for this purchase
        const remainingPayments = await dbAdapter.purchasePaymentMethodAdapter.getAll({
            purchase: payment.purchase,
            deletedAt: null
        });

        // Calculate remaining total paid amount
        const totalPaid = remainingPayments.reduce((sum, pm) => sum + pm.amount, 0);

        // Determine new purchase status
        let newStatus = PurchaseStatusEnum.IN_PROGRESS;
        if (totalPaid === 0) {
            newStatus = PurchaseStatusEnum.DRAFT;
        } else if (totalPaid >= payment.totalAgreedToPay) {
            newStatus = PurchaseStatusEnum.READY_FOR_CONFIRMATION;
        }

        // Update purchase status
        await dbAdapter.purchaseAdapter.update(payment.purchase, { status: newStatus }, { session: transaction.session });

        await transaction.commit();
    } catch (error) {
        await transaction.rollback();
        throw new Error(error.message);
    } finally {
        await transaction.end();
    }
};

module.exports = {
    createPaymentMethod,
    getPaymentsByPurchase,
    removePaymentMethod
};
