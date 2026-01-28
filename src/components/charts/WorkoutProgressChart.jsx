import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const WorkoutProgressChart = ({ scheduleItems }) => {
  if (!scheduleItems || scheduleItems.length === 0) {
    return <div className="text-[10px] font-bold text-gray-300 uppercase">No Data</div>;
  }

  const total = scheduleItems.length;
  const counts = scheduleItems.reduce((acc, item) => {
    const status = item.status || 'planned';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const data = [
    { name: 'Completed', value: counts.completed || 0, color: '#10b981' },
    { name: 'Planned', value: counts.planned || 0, color: '#3b82f6' }, 
    { name: 'Missed', value: counts.missed || 0, color: '#ef4444' }
  ].filter(d => d.value > 0); // Chỉ hiển thị phần có giá trị > 0

  const completedPercent = Math.round(((counts.completed || 0) / total) * 100);

  return (
    <div className="flex items-center gap-2">
      {/* Vòng tròn biểu đồ */}
      <div className="w-12 h-12 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={15}
              outerRadius={22}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* Con số % ở giữa */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[8px] font-black text-gray-800">{completedPercent}%</span>
        </div>
      </div>
      {/* Chú thích nhỏ bên cạnh */}
      <div className="flex flex-col gap-0.5">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[7px] font-black text-gray-400 uppercase tracking-tighter">
              {item.name.charAt(0)}: {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default WorkoutProgressChart;