const express = require('express');
const axios = require('axios');
const BP = require('bp-api').default;

const app = express();
const PORT = 3000;

const DOMAIN = 'testaprokat666.bpium.ru';
const LOGIN = 'vovachka@icloud.com';
const PASSWORD = '';
const ORDER_CATALOG_ID = '13';
const STORAGE_CATALOG_ID = '14';

const bp = new BP(DOMAIN, LOGIN, PASSWORD);

let recordsStatuses = {};

async function fetchRecords() {
    try {
        const records = await bp.getAllRecords(ORDER_CATALOG_ID, {});
        for (let record of records) {
            recordsStatuses[record.id] = record.values[2]; // Assuming 2 is the fieldId for status
            console.log(record.values[2])
        }
    } catch (error) {
        console.error('Error fetching records:', error);
    }
}

app.use(express.json());

app.post('/webhook-endpoint', async (req, res) => {
    try {
        const response = await axios.get('https://test.bpium.ru/api/webrequest/request');
        const value = response.data.value;

        const updatedRecordId = req.body.payload.recordId;
        const updatedStatus = req.body.payload.values[2];

        if (recordsStatuses[updatedRecordId] !== updatedStatus) {
            // Update comment in Orders
            await bp.patchRecord(ORDER_CATALOG_ID, updatedRecordId, {
                3: value
            });

            // Find and update the corresponding record in Storage
            const storageRecords = await bp.getAllRecords(STORAGE_CATALOG_ID, {});
            const targetRecord = storageRecords.find(record => 
                record.values[3] && record.values[3].some(order => order.recordId === updatedRecordId)
            );

            if (targetRecord) {
                await bp.patchRecord(STORAGE_CATALOG_ID, targetRecord.id, {
                    4: value // Assuming 4 is the fieldId for the "Комментарий" field in the "Склад" catalog
                });
            }

            recordsStatuses[updatedRecordId] = updatedStatus;
        }

        res.status(200).send('Updated successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/webhook-endpoint-delete', async (req, res) => {
    try {
        await fetchRecords(); // Refetch all records and update recordsStatuses
        res.status(200).send('Processed successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    fetchRecords(); // Fetch records and their statuses on server start
});
