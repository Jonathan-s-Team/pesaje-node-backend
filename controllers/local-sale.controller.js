const { response } = require('express');
const { create } = require('../services/local-sale.service');

const createLocalSale = async (req, res = response) => {
    try {
        const localSale = await create(req.body);
        res.status(201).json({ ok: true, message: 'Local sale created successfully', data: localSale });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

module.exports = {
    createLocalSale
};
