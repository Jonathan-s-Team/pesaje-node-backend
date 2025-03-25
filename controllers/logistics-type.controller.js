const { response } = require('express');
const { getAll } = require('../services/logistics-type.service');

const getLogisticsTypes = async (req, res = response) => {
    try {
        const type = req.query.type || null;

        const data = await getAll(type);
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
    getLogisticsTypes
}