import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

export default function Barchart(props) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const selectedMonth = props.value; 

    axios
      .get(`http://localhost:3001/api/bar-chart?selectedMonth=${selectedMonth}`)
      .then((response) => {
        setChartData(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [props.value]); 
  return (
    <div>
      <h2>Bar Chart</h2>
      <ResponsiveContainer aspect={3} width={400}>
        <BarChart data={chartData} width={400} height={500}>
          <XAxis dataKey="_id" />
          <YAxis />
          <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
