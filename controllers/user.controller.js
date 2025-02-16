const { response } = require('express');
const { validationResult } = require('express-validator');

const { create, getAll, getById, remove, update } = require('../services/user.service');


const createUser = async (req, res = response) => {
    try {
        const user = await create(req.body);
        res.status(201).json({
            ok: true,
            message: "User created successfully"
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: error.message
        });
    }
};

const getUsers = async (req, res = response) => {
    try {
        const includeDeleted = req.query.includeDeleted === 'true';
        const users = await getAll(includeDeleted);
        res.status(200).json({
            ok: true,
            users,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};

const getUserById = async (req, res = response) => {
    try {
        const user = await getById(req.params.id);
        if (!user) return res.status(404).json({
            ok: false,
            message: 'User not found'
        });
        res.status(200).json({
            ok: true,
            ...user,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            message: error.message
        });
    }
};

const updateUser = async (req, res = response) => {
    try {
        const updatedUser = await update(req.params.id, req.body);
        res.status(200).json({
            ok: true,
            updatedUser,
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            message: error.message
        });
    }
};

const deleteUser = async (req, res = response) => {
    try {
        const { id } = req.params;

        await remove(id); // Call service function

        res.status(200).json({
            ok: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(error.status || 500).json({
            ok: false,
            message: error.message
        });
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
}