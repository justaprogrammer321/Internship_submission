const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors'); 

const app = express();
app.use(cors());
const port = 3001;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/your-new-database', { useNewUrlParser: true, useUnifiedTopology: true });

const productTransactionSchema = new mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  sold: Boolean,
  dateOfSale: Date,
});

const ProductTransaction = mongoose.model('ProductTransaction', productTransactionSchema);

app.use(bodyParser.json());

// Endpoint to initialize the database
app.post('/initialize-database', async (req, res) => {
  try {
 
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const seedData = response.data;
    console.log(seedData)

    await ProductTransaction.deleteMany();

 
    await ProductTransaction.insertMany(seedData);

    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// List all transactions API endpoint
app.get('/transactions',async(req,res)=>{
    try {
        const { search, page = 1, perPage = 10 } = req.query;
        const skip = (page - 1) * perPage;
      
        let filter = {};
        if (search) {
          filter.$or = [
            { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { price: !isNaN(parseFloat(search)) ? parseFloat(search) : null },
          ];
        }
      
        const totalCount = await ProductTransaction.countDocuments(filter);
        const products = await ProductTransaction.find(filter)
          .skip(skip)
          .limit(parseInt(perPage));
      
        const totalPages = Math.ceil(totalCount / perPage);
      
        res.json({
          products,
          pageInfo: {
            page: parseInt(page),
            perPage: parseInt(perPage),
            totalItems: totalCount,
            totalPages: totalPages
          }
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
      
});

app.get('/api/stats', async (req, res) => {
    try {
      const { selectedMonth } = req.query;

      const startDate = new Date(selectedMonth);
  
      const endDate = new Date(selectedMonth);
      endDate.setDate(1);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(endDate.getDate() - 1);
  
      // Query to get total sale amount of selected month
      const totalSaleAmount = await ProductTransaction.aggregate([
        {
          $match: {
            sold: true,
            dateOfSale: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$price' },
          },
        },
      ]);
  
      const totalSoldItems = await ProductTransaction.countDocuments({
        sold: true,
        dateOfSale: { $gte: startDate, $lte: endDate },
      });
  
      
      const totalNotSoldItems = await ProductTransaction.countDocuments({
        sold: false,
        dateOfSale: { $gte: startDate, $lte: endDate },
      });
  
      res.json({
        totalSaleAmount: totalSaleAmount.length > 0 ? totalSaleAmount[0].totalAmount : 0,
        totalSoldItems,
        totalNotSoldItems,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.get('/api/bar-chart', async (req, res) => {
    try {
      const { selectedMonth } = req.query;
  
      const startDate = new Date(selectedMonth);
  
      const endDate = new Date(selectedMonth);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(endDate.getDate() - 1);
  
      // Define price ranges
      const priceRanges = [
        { min: 0, max: 100 },
        { min: 101, max: 200 },
        { min: 201, max: 300 },
        { min: 301, max: 400 },
        { min: 401, max: 500 },
        { min: 501, max: 600 },
        { min: 601, max: 700 },
        { min: 701, max: 800 },
        { min: 801, max: 900 },
        { min: 901, max: 9999 },
      ];
  
      
      const barChartData = await ProductTransaction.aggregate([
        {
          $match: {
            dateOfSale: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              $switch: {
                branches: priceRanges.map(({ min, max }) => ({
                  case: {
                    $and: [
                      { $gte: ['$price', min] },
                      { $lt: ['$price', max] },
                    ],
                  },
                  then: `${min}-${max}`,
                })),
                default: 'Unknown',
              },
            },
            count: { $sum: 1 },
          },
        },
      ]);
  
      res.json(barChartData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  app.get('/api/pie-chart', async (req, res) => {
    try {
      const { selectedMonth } = req.query;
  
      
      const startDate = new Date(selectedMonth);
  
      
      const endDate = new Date(selectedMonth);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(endDate.getDate() - 1);
  
      // Aggregation pipeline to group by category and count the number of items
      const pieChartData = await ProductTransaction.aggregate([
        {
          $match: {
            dateOfSale: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]);
  
      res.json(pieChartData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  const fetchStatsData = async (selectedMonth) => {
    try {
      const response = await fetch(`http://localhost:${port}/api/stats?selectedMonth=${selectedMonth}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching /api/stats data:', error);
      return { error: 'Error fetching /api/stats data' };
    }
  };
  
  // Function to fetch data from /api/bar-chart endpoint
  const fetchBarChartData = async (selectedMonth) => {
    try {
      const response = await fetch(`http://localhost:${port}/api/bar-chart?selectedMonth=${selectedMonth}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching /api/bar-chart data:', error);
      return { error: 'Error fetching /api/bar-chart data' };
    }
  };
  
  // Function to fetch data from /api/pie-chart endpoint
  const fetchPieChartData = async (selectedMonth) => {
    try {
      const response = await fetch(`http://localhost:${port}/api/pie-chart?selectedMonth=${selectedMonth}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching /api/pie-chart data:', error);
      return { error: 'Error fetching /api/pie-chart data' };
    }
  };
  
  // API endpoint to fetch combined data
  app.get('/api/combined-data', async (req, res) => {
    try {
      const { selectedMonth } = req.query;
  
      // Fetch data from all three APIs concurrently
      const [statsData, barChartData, pieChartData] = await Promise.all([
        fetchStatsData(selectedMonth),
        fetchBarChartData(selectedMonth),
        fetchPieChartData(selectedMonth),
      ]);
  
      // Combine responses into a final JSON
      const combinedData = {
        statsData,
        barChartData,
        pieChartData,
      };
  
      res.json(combinedData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
