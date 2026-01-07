'use client';

import { useState } from 'react';

const seasons = {
  winter: [12, 1, 2],
  spring: [3, 4, 5],
  summer: [6, 7, 8],
  autumn: [9, 10, 11]
};

export default function Home() {
  const [address, setAddress] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [seasonCalc, setSeasonCalc] = useState({
    season: 'winter',
    days: '',
    efficiency: '20'
  });
  const [seasonResult, setSeasonResult] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to calculate');
    }
    setLoading(false);
  };

  const calculateSeason = () => {
    if (!result || !seasonCalc.days) return;
    const months = seasons[seasonCalc.season as keyof typeof seasons];
    const avgIrr = months.reduce((sum, m) => {
      const monthData = result.monthlyGeneration.find((mg: any) => mg.month === m);
      return sum + (monthData ? parseFloat(monthData.irradiation) : 0);
    }, 0) / months.length;
    const dailyGen = 50 * (parseFloat(seasonCalc.efficiency) / 100) * (avgIrr / 30); // assume 30 days/month
    const total = dailyGen * parseFloat(seasonCalc.days);
    setSeasonResult(`Estimated energy: ${total.toFixed(2)} kWh`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Calculator */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-6">Solar Panel Monitor</h1>
          <form onSubmit={handleSubmit} className="mb-6">
            <label className="block text-sm font-medium mb-2">Home Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 border rounded mb-4"
              placeholder="Enter your home address"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? 'Calculating...' : 'Get Solar Data'}
            </button>
          </form>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {result && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-100 p-4 rounded">
                  <h3 className="font-bold">Real-Time Generation</h3>
                  <p>{result.realTimeGeneration} kWh/h (est.)</p>
                </div>
                <div className="bg-blue-100 p-4 rounded">
                  <h3 className="font-bold">Current Month</h3>
                  <p>{result.currentGeneration} kWh</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded">
                  <h3 className="font-bold">Accumulated</h3>
                  <p>{result.accumulatedEnergy} kWh</p>
                </div>
                <div className="bg-purple-100 p-4 rounded">
                  <h3 className="font-bold">Roof Area</h3>
                  <p>{result.roofArea} m²</p>
                </div>
              </div>
              <div className="mb-6">
                <h3 className="font-bold">Building Details</h3>
                <p>Max Solar Panels: {result.maxPanels}</p>
                <p>Max Array Capacity: {result.maxCapacity} m²</p>
                <p>Annual Sunshine Hours: {result.annualKwh}</p>
                <p>Annual Generation: {result.annualGeneration} kWh</p>
                <p>Annual Savings: {result.savings} EUR</p>
              </div>
              <h2 className="text-xl font-bold mb-4">Monthly Energy Calendar</h2>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                {result.monthlyGeneration.map((month: any) => (
                  <div key={month.month} className="bg-gray-50 p-2 rounded text-center">
                    <div className="font-semibold">Month {month.month}</div>
                    <div>{month.generation} kWh</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Seasonal Calculator */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Seasonal Energy Calculator</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Season</label>
              <select
                value={seasonCalc.season}
                onChange={(e) => setSeasonCalc({ ...seasonCalc, season: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="winter">Winter</option>
                <option value="spring">Spring</option>
                <option value="summer">Summer</option>
                <option value="autumn">Autumn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Number of Days</label>
              <input
                type="number"
                value={seasonCalc.days}
                onChange={(e) => setSeasonCalc({ ...seasonCalc, days: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Panel Efficiency (%)</label>
              <input
                type="number"
                value={seasonCalc.efficiency}
                onChange={(e) => setSeasonCalc({ ...seasonCalc, efficiency: e.target.value })}
                className="w-full p-2 border rounded"
                step="0.01"
              />
            </div>
            <button
              onClick={calculateSeason}
              className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
            >
              Calculate
            </button>
            {seasonResult && <p className="mt-4 p-2 bg-green-50 rounded">{seasonResult}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
