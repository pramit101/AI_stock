import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
export function StockCharts() {
  // Mock data for inventory trends by hour
  const hourlyData = [{
    time: '7AM',
    bananas: 85,
    apples: 90,
    strawberries: 65,
    avocados: 75,
    carrots: 95
  }, {
    time: '10AM',
    bananas: 75,
    apples: 85,
    strawberries: 55,
    avocados: 70,
    carrots: 90
  }, {
    time: '1PM',
    bananas: 65,
    apples: 75,
    strawberries: 45,
    avocados: 60,
    carrots: 85
  }, {
    time: '4PM',
    bananas: 50,
    apples: 65,
    strawberries: 35,
    avocados: 50,
    carrots: 75
  }, {
    time: '7PM',
    bananas: 40,
    apples: 55,
    strawberries: 30,
    avocados: 40,
    carrots: 65
  }, {
    time: '10PM',
    bananas: 30,
    apples: 45,
    strawberries: 25,
    avocados: 35,
    carrots: 55
  }];
  const colors = ['#4ade80', '#22d3ee', '#fb7185', '#f59e0b', '#a78bfa'];
  return <div className="bg-white rounded-lg shadow h-full flex flex-col">
      <div className="p-3 border-b">
        <h3 className="text-lg font-medium">Inventory Trends</h3>
        <p className="text-xs text-gray-500">Stock levels throughout the day</p>
      </div>
      <div className="p-2 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={hourlyData} margin={{
          top: 5,
          right: 20,
          left: 0,
          bottom: 5
        }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{
            fontSize: 10
          }} />
            <YAxis domain={[0, 100]} tickFormatter={value => `${value}%`} tick={{
            fontSize: 10
          }} />
            <Tooltip formatter={value => [`${value}%`, 'Stock Level']} />
            <Legend wrapperStyle={{
            fontSize: '10px'
          }} />
            <Line type="monotone" dataKey="bananas" stroke={colors[0]} activeDot={{
            r: 6
          }} strokeWidth={2} name="Bananas" />
            <Line type="monotone" dataKey="apples" stroke={colors[1]} activeDot={{
            r: 6
          }} strokeWidth={2} name="Apples" />
            <Line type="monotone" dataKey="strawberries" stroke={colors[2]} activeDot={{
            r: 6
          }} strokeWidth={2} name="Strawberries" />
            <Line type="monotone" dataKey="avocados" stroke={colors[3]} activeDot={{
            r: 6
          }} strokeWidth={2} name="Avocados" />
            <Line type="monotone" dataKey="carrots" stroke={colors[4]} activeDot={{
            r: 6
          }} strokeWidth={2} name="Carrots" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>;
}