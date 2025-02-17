const { response } = require('express');

const { getAllByUserId, getById, create, update, remove } = require('../services/broker.service');

const getAllBrokersByUserId = async (req, res = response) => {
    try {
        const { userId } = req.query;
        const brokers = await getAllByUserId(userId);
        res.json({ ok: true, data: brokers });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

const getBrokerById = async (req, res = response) => {
    try {
        const broker = await getById(req.params.id);
        if (!broker) {
            return res.status(404).json({ ok: false, message: 'Broker not found' });
        }
        res.json({ ok: true, data: broker });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

const createBroker = async (req, res = response) => {
    try {
        const broker = await create(req.body);
        res.status(201).json({ ok: true, message: 'Broker created successfully' });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

const updateBroker = async (req, res = response) => {
    try {
        const broker = await update(req.params.id, req.body);
        if (!broker) {
            return res.status(404).json({ ok: false, message: 'Broker not found' });
        }
        res.json({ ok: true, data: broker });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

const removeBroker = async (req, res) => {
    try {
        const broker = await remove(req.params.id);
        if (!broker) {
            return res.status(404).json({ ok: false, message: 'Broker not found' });
        }
        res.json({ ok: true, message: 'Broker deleted successfully' });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

module.exports = {
    getAllBrokersByUserId,
    getBrokerById,
    createBroker,
    updateBroker,
    removeBroker
};
