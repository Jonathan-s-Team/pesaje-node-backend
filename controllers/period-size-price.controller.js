const { response } = require('express');
const { getByNameAndCompany, getAllByCompany, create, update, remove } = require('../services/period-size-price.service');

const getPeriodByNameAndCompany = async (req, res = response) => {
    try {
        const { name, companyId } = req.query;

        // Fetch period by name and company, including sizePrices
        const period = await getByNameAndCompany(name, companyId);

        if (!period) {
            return res.status(404).json({ ok: false, message: 'Period not found' });
        }

        res.json({ ok: true, data: period });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

const getAllPeriodsByCompany = async (req, res = response) => {
    try {
        const { companyId } = req.query;

        const periods = await getAllByCompany(companyId);

        res.json({ ok: true, data: periods });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

const createPeriod = async (req, res = response) => {
    try {
        const period = await create(req.body);
        res.status(201).json({ ok: true, message: 'Period and SizePrices created successfully', data: period });
    } catch (error) {
        res.status(400).json({ ok: false, message: error.message });
    }
};

const updatePeriod = async (req, res = response) => {
    try {
        const { id } = req.params;
        const { name, sizePrices } = req.body;

        // Ensure only allowed fields are updated
        const updatedPeriod = await update(id, { name, sizePrices });

        res.json({ ok: true, message: 'Period updated successfully', data: updatedPeriod });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};


const removePeriod = async (req, res) => {
    try {
        const result = await remove(req.params.id);
        res.json({ ok: true, message: result.message });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

module.exports = {
    getPeriodByNameAndCompany,
    getAllPeriodsByCompany,
    createPeriod,
    updatePeriod,
    removePeriod
};
