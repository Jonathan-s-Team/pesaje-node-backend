const { response } = require('express');
const reportService = require('../services/report.service');

const getEconomicReportByParams = async (req, res = response) => {
    try {
        const { includeDeleted, clientId, userId, periodId, controlNumber } = req.query;

        const filters = {
            includeDeleted: includeDeleted === 'true',
            clientId,
            userId,
            periodId,
            controlNumber
        };

        const report = await reportService.getEconomicReportByParams(filters);

        res.json({ ok: true, data: report });
    } catch (error) {
        res.status(500).json({ ok: false, message: error.message });
    }
};

module.exports = {
    getEconomicReportByParams
};
