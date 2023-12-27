const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const driver = require('../Config/db.config');

const registerUser = async (username, password, companyId) => {
    const session = driver.session();
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const result = await session.run(
            'CREATE (u:User {id: $id, username: $username, password: $password})-[:BELONGS_TO]->(:Company {companyId: $companyId}) RETURN u',
            { id: uuidv4(), username, password: hashedPassword, companyId }
        );

        session.close();
        return result;
    } catch (error) {
        throw error;
    }
};

const loginUser = async (username, password) => {
    const session = driver.session();

    try {
        const result = await session.run(
            'MATCH (u:User {username: $username}) RETURN u',
            { username }
        );

        const user = result.records[0];

        if (!user) {
            throw new Error('User not found');
        } else {
            const storedPassword = user.get('u').properties.password;

            const passwordMatch = await bcrypt.compare(password, storedPassword);

            if (passwordMatch) {
                return 'Login successful!';
            } else {
                throw new Error('Invalid credentials');
            }
        }
    } catch (error) {
        throw error;
    }
};

const registerCompany = async (companyName) => {
    const session = driver.session();

    try {
        const result = await session.run(
            'CREATE (c:Company {companyId: $companyId, companyName: $companyName}) RETURN c',
            { companyId: uuidv4(), companyName }
        );

        session.close();
        const companyId = result.records[0].get(0).properties.companyId;
        return { companyId, message: 'Company registered successfully!' };
    } catch (error) {
        throw error;
    }
};

const getUsersByCompany = async (companyId) => {
    const session = driver.session();

    try {
        const result = await session.run(
            'MATCH (c:Company {companyId: $companyId})<-[:BELONGS_TO]-(u:User) RETURN u',
            { companyId }
        );

        session.close();
        return result.records.map(record => record.get('u').properties);
    } catch (error) {
        console.error('Error in getUsersByCompany:', error);
        throw error;
    }
};

const updateCompanyByUUID = async (companyId, updatedProperties) => {
    const session = driver.session();

    try {
        const result = await session.run(
            `MATCH (c:Company { companyId: $companyId }) SET c += $updatedProperties RETURN c`,
            { companyId: companyId, updatedProperties }
        );

        session.close();

        if (result.records.length === 0) {
            return null; 
        }

        const updatedCompany = result.records[0].get('c').properties;
        return updatedCompany;
    } catch (error) {
        throw error;
    }
};

const deleteCompanyByUUID = async (companyId) => {
    const session = driver.session();

    try {
        const result = await session.run(
            `MATCH (c:Company { companyId: $companyId }) DELETE c`,
            { companyId: companyId }
        );

        session.close();

        if (result.summary.counters._stats.nodesDeleted === 0) {
            throw new Error('Company not found');
        }

        return 'Company deleted successfully';
    } catch (error) {
        console.error('Error deleting company:', error);
        throw error;
    }
};

const updateUserById = async (id, updatedProperties) => {
    const session = driver.session();

    try {
        const result = await session.run(
            `MATCH (u:User { id: $id }) SET u += $updatedProperties RETURN u`,
            { id: id, updatedProperties }
        );

        session.close();

        if (result.records.length === 0) {
            return null; 
        }

        const updatedUser = result.records[0].get('u').properties;
        return updatedUser;
    } catch (error) {
        console.error('Error updating user properties:', error); 
        throw error;
    }
};

const deleteUserById = async (id) => {
    const session = driver.session();

    try {
        // Delete relationships connected to the user node
        await session.run(
            `MATCH (u:User { id: $id })-[r]-() DELETE r`,
            { id: id }
        );

        // Then delete the user node
        const result = await session.run(
            `MATCH (u:User { id: $id }) DELETE u`,
            { id: id }
        );

        session.close();

        if (result.summary.counters._stats.nodesDeleted === 0) {
            throw new Error('User not found');
        }

        return 'User deleted successfully';
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
};

module.exports = { registerUser, registerCompany, loginUser, getUsersByCompany, updateCompanyByUUID, deleteCompanyByUUID, updateUserById, deleteUserById };
