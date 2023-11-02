<template>
  <q-page class="flex flex-center">
    <div>
      <div>
        <q-input v-model="orderComment" label="Комментарий" />
        <q-select
          v-model="orderStatus"
          :options="statusOptions"
          label="Статус"
          emit-value
          map-options
        />
      </div>
      <q-btn @click="createOrder" label="Создать заказ" />
    </div>
  </q-page>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      orderComment: '',
      orderStatus: '1', // По умолчанию статус "новый"
      statusOptions: [
        { label: 'Выполнен', value: '2' },
        { label: 'Новый', value: '1' }
      ]
    };
  },
  methods: {
    async createOrder() {
      try {
        const response = await axios.post('http://85.192.40.14:5000/create-order', {
          values: {
            2: [this.orderStatus],
            3: this.orderComment
          }
        });
        this.$q.notify({
          type: 'positive',
          message: 'Заказ успешно создан!'
        });
      } catch (error) {
        console.error('Error:', error);
        this.$q.notify({
          type: 'negative',
          message: 'Ошибка при создании заказа.'
        });
      }
    }
  }
};
</script>
