const { response } = require('express');
const { validationResult } = require('express-validator');

const { create, getAll, getById, remove, update } = require('../services/paymentInfo.service');


const createPaymentInfo = async (req, res = response) => {
    try {
        const paymentInfo = await create(req.body);
        res.status(201).json({
            ok: true,
            message: "PaymentInfo created successfully"
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: error.message
        });
    }
};

const getPaymentInfosByPerson = async (req, res = response) => {
    try {
        const { personId } = req.query; // Extract userId from query params
        const paymentInfos = await getAll(personId); // Pass personId to service

        res.status(200).json({
            ok: true,
            paymentInfos,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};

const getPaymentInfoById = async (req, res = response) => {
    try {
        const paymentInfo = await getById(req.params.id);
        if (!paymentInfo) return res.status(404).json({
            ok: false,
            message: 'PaymentInfo not found'
        });
        res.status(200).json({
            ok: true,
            paymentInfo,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};

const updatePaymentInfo = async (req, res = response) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Prevent `personId` from being updated
        if (updateData.personId) {
            delete updateData.personId;
        }

        const updatedPaymentInfo = await update(id, updateData);

        res.status(200).json({
            ok: true,
            updatedPaymentInfo,
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: error.message
        });
    }
};


const deletePaymentInfo = async (req, res = response) => {
    try {
        const { id } = req.params;

        await remove(id); // Call service function

        res.status(200).json({
            ok: true,
            message: 'PaymentInfo deleted successfully'
        });
    } catch (error) {
        res.status(error.status || 500).json({
            ok: false,
            message: error.message
        });
    }
};


module.exports = {
    createPaymentInfo,
    getPaymentInfosByPerson,
    getPaymentInfoById,
    updatePaymentInfo,
    deletePaymentInfo
}