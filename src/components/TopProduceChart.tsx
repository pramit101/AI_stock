import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
export function TopProduceChart() {
  const [activeIndex, setActiveIndex] = useState(0);
  // Mock data for popular produce
  const topProduceData = [{
    name: 'Bananas',
    value: 35
  }, {
    name: 'Apples',
    value: 25
  }, {
    name: 'Strawberries',
    value: 18
  }, {
    name: 'Avocados',
    value: 15
  }, {
    name: 'Carrots',
    value: 12
  }];
  // More vibrant colors
  const COLORS = ['#10b981', '#3b82f6', '#f43f5e', '#f97316', '#8b5cf6'];
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  const renderActiveShape = props => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';
    return <g>
        <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-xs font-medium">
          {payload.name}
        </text>
        <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius} startAngle={startAngle} endAngle={endAngle} fill={fill} />
        <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 6} outerRadius={outerRadius + 10} fill={fill} />
        <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
        <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="text-xs">
          {`${value} units`}
        </text>
        <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
          {`(${(percent * 100).toFixed(0)}%)`}
        </text>
      </g>;
  };
  return <div className="bg-white rounded-lg shadow h-full flex flex-col">
      <div className="p-3 border-b">
        <h3 className="text-lg font-medium">Popular Produce</h3>
        <p className="text-xs text-gray-500">By sales volume</p>
      </div>
      <div className="p-2 flex-1 flex flex-col">
        <div className="h-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie activeIndex={activeIndex} activeShape={renderActiveShape} data={topProduceData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} fill="#8884d8" dataKey="value" onMouseEnter={onPieEnter} paddingAngle={5}>
                {topProduceData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />)}
              </Pie>
              <Tooltip formatter={value => [`${value} units`, 'Sales']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topProduceData.map((item, index) => <tr key={index} className="hover:bg-gray-50 cursor-pointer" onMouseEnter={() => setActiveIndex(index)}>
                  <td className="py-1">
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full mr-2" style={{
                    backgroundColor: COLORS[index % COLORS.length]
                  }}></span>
                      <span className="text-xs font-medium">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-1 text-right text-xs">
                    {item.value} units
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
}