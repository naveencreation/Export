import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function verify() {
    try {
        console.log('1. Creating Category...');
        const categoryRes = await axios.post(`${API_URL}/categories`, {
            name: 'Electronics',
        });
        console.log('Category Created:', categoryRes.data);
        const categoryId = categoryRes.data.id;

        console.log('\n2. Creating In-Stock Product...');
        const p1 = await axios.post(`${API_URL}/products`, {
            name: 'Laptop',
            price: 1200,
            quantity: 15,
            categoryId,
        });
        console.log('Product 1 Created:', p1.data);

        console.log('\n3. Creating Low-Stock Product...');
        const p2 = await axios.post(`${API_URL}/products`, {
            name: 'Phone',
            price: 800,
            quantity: 5,
            categoryId,
        });
        console.log('Product 2 Created:', p2.data);

        console.log('\n4. Fetching Dashboard Stats...');
        const stats = await axios.get(`${API_URL}/dashboard/stats`);
        console.log('Dashboard Stats:', stats.data);

        if (
            stats.data.totalProducts === 2 &&
            stats.data.inStock === 1 &&
            stats.data.lowStock === 1
        ) {
            console.log('\n✅ VERIFICATION SUCCESSFUL');
        } else {
            console.error('\n❌ VERIFICATION FAILED: Stats do not match expected values');
        }
    } catch (error: any) {
        console.error('\n❌ VERIFICATION FAILED:', error.response?.data || error.message);
    }
}

verify();
