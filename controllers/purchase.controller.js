const { response } = require('express');
const {
    getAll,
    getById,
    create,
    update,
    remove
} = require('../services/purchase.service');

const getAllPurchases = async (req, res = response) => {
    try {
        const { includeDeleted, clientId, userId, periodId } = req.query;

        const filters = {
            includeDeleted: includeDeleted === 'true',
            clientId,
            userId,
            periodId,
        };

        const purchases = await getAll(filters);

        res.json({ ok: true, data: purchases });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

const getPurchaseById = async (req, res = response) => {
    try {
        const purchase = await getById(req.params.id);
        if (!purchase) {
            return res.status(404).json({ ok: false, message: 'Purchase not found' });
        }
        res.json({ ok: true, data: purchase });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

const createPurchase = async (req, res = response) => {
    try {
        const purchase = await create(req.body);
        res.status(201).json({ ok: true, data: purchase, message: 'Purchase created successfully' });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

const updatePurchase = async (req, res = response) => {
    try {
        const updatedPurchase = await update(req.params.id, req.body);
        res.json({ ok: true, data: updatedPurchase, message: 'Purchase updated successfully' });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

const deletePurchase = async (req, res = response) => {
    try {
        await remove(req.params.id);
        res.json({ ok: true, message: 'Purchase deleted successfully' });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

module.exports = {
    getAllPurchases,
    getPurchaseById,
    createPurchase,
    updatePurchase,
    deletePurchase
};
