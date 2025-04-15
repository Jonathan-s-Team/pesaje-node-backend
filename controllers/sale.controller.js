const { response } = require('express');
const saleService = require('../services/sale.service');



const getSalesByParams = async (req, res = response) => {
    try {
        const { userId, controlNumber } = req.query;
        const includeDeleted = req.query.includeDeleted === 'true';

        const data = await saleService.getAllByParams({ userId, controlNumber, includeDeleted });
        res.json({ ok: true, data });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

module.exports = {
    getSalesByParams
};
