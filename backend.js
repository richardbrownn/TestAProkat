const express = require('express');
const cors = require('cors');
const BP = require('bp-api').default;

const app = express();
const PORT = 5000;

const DOMAIN = 'testaprokat666.bpium.ru';
const LOGIN = 'vovachka@icloud.com';
const PASSWORD = '';
const ORDER_CATALOG_ID = '13';

const bp = new BP(DOMAIN, LOGIN, PASSWORD);

app.use(cors());
app.use(express.json());

app.post('/create-order', async (req, res) => {
    try {
        const orderData = req.body;

        // Проверка данных
        if (!orderData || !orderData.values) {
            return res.status(400).send('Invalid order data');
        }

        // Структурируем данные для создания нового заказа
        const newOrderData = {
            values: {
                2: [orderData.values[2]],  // Статус
                3: [orderData.values[3]], // Комментарий
            }
        };

        // Убедимся, что статус не является вложенным массивом
        if (Array.isArray(newOrderData.values[2][0])) {
            newOrderData.values[2] = newOrderData.values[2][0];
        }

        // Создание новой записи в каталоге "Заказы"
        const newOrder = await bp.postRecord(ORDER_CATALOG_ID, newOrderData.values);

        res.status(200).send(newOrder);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
