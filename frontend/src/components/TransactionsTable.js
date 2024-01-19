import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Barchart from './Barchart';

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('2022-03');
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/transactions?search=${searchTerm}&page=${currentPage}&perPage=${perPage}`);
        setTransactions(response.data.products);
        setTotalPages(response.data.pageInfo.totalPages);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [searchTerm, currentPage, perPage]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setSelectedMonth(newMonth);
    fetchStats(newMonth);
  };

  const fetchStats = async (month) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001/api/stats?selectedMonth=${month}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="container mx-auto p-4 px-2">
      <div className='flex'>
        <div className="mb-4">
          <input type="text" placeholder="Search" value={searchTerm} onChange={handleSearch} className="border p-2" />
        </div>

        <div className="mb-4 px-2">
          <label htmlFor="month" className="mr-2">Select Month: </label>
          <select id="month" onChange={handleMonthChange} className="border p-2">
            <option value="">Select</option>
            <option value="2021-01">January 2021</option>
              <option value="2021-02">February 2021</option>
              <option value="2021-03">March 2021</option>
              <option value="2021-04">April 2021</option>
              <option value="2021-05">May 2021</option>
              <option value="2021-06">June 2021</option>
              <option value="2021-07">July 2021</option>
              <option value="2021-08">August 2021</option>
              <option value="2021-09">September 2021</option>
              <option value="2021-10">October 2021</option>
              <option value="2021-11">November 2021</option>
              <option value="2021-12">December 2021</option>
              <option value="2022-01">January 2022</option>
              <option value="2022-02">February 2022</option>
              <option value="2022-03">March 2022</option>
              <option value="2022-04">April 2022</option>
              <option value="2022-05">May 2022</option>
              <option value="2022-06">June 2022</option>
              <option value="2022-07">July 2022</option>
              <option value="2022-08">August 2022</option>
              <option value="2022-09">September 2022</option>
              <option value="2022-10">October 2022</option>
              <option value="2022-11">November 2022</option>
              <option value="2022-12">December 2022</option>
          </select>
        </div>
      </div>
      <div className='flex p-10'>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className='border-2 p-4 rounded-lg'>
          <h2>Statistics for {selectedMonth}</h2>
          <p>Total Sale Amount: {stats.totalSaleAmount}</p>
          <p>Total Sold Items: {stats.totalSoldItems}</p>
          <p>Total Not Sold Items: {stats.totalNotSoldItems}</p>
        </div>
      )}
      <Barchart value={selectedMonth}/>
      </div>
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Title</th>
            <th className="border p-2">Price</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Category</th>
            <th className="border p-2">Sold</th>
            <th className="border p-2">Image</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td className="border p-2">{transaction.id}</td>
              <td className="border p-2">{transaction.title}</td>
              <td className="border p-2">{transaction.price}</td>
              <td className="border p-2">{transaction.description}</td>
              <td className="border p-2">{transaction.category}</td>
              <td className="border p-2">{transaction.sold ? 'Yes' : 'No'}</td>
              <td className="border p-2">
                <a href={transaction.image} target="_blank" rel="noopener noreferrer">
                  <img src={transaction.image} alt={transaction.title} className="w-16 h-16 object-cover" />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between items-center">
        <span>Page {currentPage} of {totalPages}</span>
        <div>
          <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="mr-2 px-4 py-2 bg-blue-500 text-white rounded">
            Previous
          </button>
          <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-blue-500 text-white rounded">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTable;

