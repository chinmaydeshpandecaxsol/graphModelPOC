const express = require('express');
const router = express.Router();
const { registerCompany, registerUser, loginUser, getUsersByCompany, updateCompanyByUUID, deleteCompanyByUUID, updateUserById, deleteUserById  } = require('../Controller/auth.controller');

router.post('/registerUser', async (req, res) => {
    const { username, password, companyId } = req.body;

    try {
        await registerUser(username, password, companyId);
        res.status(201).send('User registered successfully!');
    } catch (error) {
        res.status(500).send('Error registering user');
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await loginUser(username, password);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send('Error logging in');
    }
});

router.post('/registerCompany', async (req, res) => {
    const { companyName } = req.body;

    try {
        const companyData = await registerCompany(companyName);
        res.status(201).json(companyData);
    } catch (error) {
        res.status(500).send('Error registering company');
    }
});

router.get('/users/:companyId', async (req, res) => {
    const { companyId } = req.params;

    try {
        const users = await getUsersByCompany(companyId);
        res.status(200).json(users);
    } catch (error) {
        console.error('Error in fetching users:', error);
        res.status(500).send('Error fetching users by company');
    }
});

router.put('/company/update/:companyId', async (req, res) => {
    const { companyId } = req.params;
    const updatedProperties = req.body;

    try {
        const updatedCompany = await updateCompanyByUUID(companyId, updatedProperties);

        if (!updatedCompany) {
            res.status(404).send('Company not found');
            return;
        }

        res.status(200).json(updatedCompany);
    } catch (error) {
        res.status(500).send('Error updating company properties');
    }
});

router.delete('/company/delete/:companyId', async (req, res) => {
    const { companyId } = req.params;

    try {
        const deletionResult = await deleteCompanyByUUID(companyId);
        res.status(200).send(deletionResult);
    } catch (error) {
        res.status(404).send(error.message);
    }
});

router.put('/user/update/:id', async (req, res) => {
    const { id } = req.params;
    const updatedProperties = req.body;

    try {
        const updatedUser = await updateUserById(id, updatedProperties);

        if (!updatedUser) {
            res.status(404).send('User not found');
            return;
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).send('Error updating user properties');
    }
});

router.delete('/user/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletionResult = await deleteUserById(id);
        res.status(200).send(deletionResult);
    } catch (error) {
        res.status(404).send(error.message);
    }
});

module.exports = router;