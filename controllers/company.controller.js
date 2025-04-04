const { response } = require('express');
const { getAll } = require('../services/company.service');

const getCompanies = async (req, res = response) => {
    try {
        const data = await getAll();
        res.status(200).json({
            ok: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};

module.exports = {
    getCompanies
}