const express = require('express');
const BP = require('bp-api').default;

const app = express();
const PORT = 4000;

const DOMAIN = 'testaprokat666.bpium.ru';
const LOGIN = 'vovachka@icloud.com';
const PASSWORD = '';
const ORDER_CATALOG_ID = '13';
const STORAGE_CATALOG_ID = '14';

const bp = new BP(DOMAIN, LOGIN, PASSWORD);

let existingOrders = new Set();

async function fetchOrders() {
    try {
        const records = await bp.getAllRecords(ORDER_CATALOG_ID, {});
        for (let record of records) {
            existingOrders.add(record.id);
        }
    } catch (error) {
        console.error('Error fetching orders:', error);
    }
}

app.use(express.json());

app.post('/webhook-endpoint', async (req, res) => {
    try {
        const currentOrders = await bp.getAllRecords(ORDER_CATALOG_ID, {});
        let newOrder;

        for (let order of currentOrders) {
            if (!existingOrders.has(order.id)) {
                newOrder = order;
                break;
            }
        }

        if (newOrder) {
            const newRecordData = {
                3: [{
                    sectionId: '1',
                    catalogId: ORDER_CATALOG_ID,
                    catalogTitle: 'Заказы',
                    catalogIcon: 'business-2',
                    recordId: newOrder.id,
                    recordTitle: newOrder.title,
                    isRemoved: false
                }],
                4: newOrder.values['3'] // Assuming that '3' is the key for the comment in the order
            };

            await bp.postRecord(STORAGE_CATALOG_ID, newRecordData);
            existingOrders.add(newOrder.id);
        }

        res.status(200).send('Processed successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.post('/webhook-endpoint-delete', async (req, res) => {
    try {
        await fetchOrders(); // Refetch all orders and update existingOrders
        res.status(200).send('Processed successfully');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    fetchOrders(); // Fetch orders on server start
});
