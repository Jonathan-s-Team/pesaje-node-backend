const { response } = require('express');
const { create } = require('../services/company-sale.service');

const createCompanySale = async (req, res = response) => {
    try {
        const companySale = await create(req.body);
        res.status(201).json({ ok: true, message: 'Company sale created successfully', data: companySale });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

module.exports = {
    createCompanySale,
};