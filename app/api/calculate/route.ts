import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    // Geocode address to lat/lon
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
    const geocodeRes = await fetch(geocodeUrl);
    const geocodeData = await geocodeRes.json();
    if (!geocodeData.length) {
      return NextResponse.json({ error: 'Address not found' }, { status: 400 });
    }
    const { lat, lon } = geocodeData[0];

    // Fetch Google Solar API for building insights
    const googleApiKey = process.env.GOOGLE_API_KEY;
    if (!googleApiKey) {
      return NextResponse.json({ error: 'Google API key not configured' }, { status: 500 });
    }
    const solarUrl = `https://solar.googleapis.com/v1/buildingInsights:findClosest?location.latitude=${lat}&location.longitude=${lon}&key=${googleApiKey}`;
    const solarRes = await fetch(solarUrl);
    const solarData = await solarRes.json();

    if (!solarData || solarData.error) {
      return NextResponse.json({ error: 'Solar data not available for this address' }, { status: 400 });
    }

    // Extract data
    const building = solarData.building;
    const roofArea = building.roofAreaMeters2 || 0;
    const solarPotential = building.solarPotential;
    const maxPanels = solarPotential.maxArrayPanelsCount || 0;
    const maxCapacity = solarPotential.maxArrayAreaMeters2 || 0;
    const annualKwh = solarPotential.maxSunshineHoursPerYear || 0; // Actually sunshine hours, but can use for estimation

    // Assume efficiency 20%, price 0.15, consumption based on area or default
    const efficiency = 20;
    const price = 0.15;
    const consumption = Math.max(roofArea * 10, 5000); // rough estimate

    // For monthly, still use PVGIS as Google doesn't provide monthly
    const pvgisUrl = `https://re.jrc.ec.europa.eu/api/PVcalc?lat=${lat}&lon=${lon}&peakpower=1&loss=14&angle=35&aspect=0&outputformat=json`;
    const pvgisRes = await fetch(pvgisUrl);
    const pvgisData = await pvgisRes.json();
    const monthlyData = pvgisData.outputs?.monthly?.fixed || [];

    const monthlyGeneration = monthlyData.map((month: any) => ({
      month: month.month,
      irradiation: month.E_m,
      generation: (roofArea * (efficiency / 100) * month.E_m).toFixed(2)
    }));

    const annualGeneration = roofArea * (efficiency / 100) * (pvgisData.outputs?.totals?.fixed?.E_y || 0);
    const savings = Math.min(annualGeneration, consumption) * price;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentGen = monthlyGeneration.find((m: any) => m.month === currentMonth)?.generation || 0;
    const accumulated = monthlyGeneration
      .filter((m: any) => m.month <= currentMonth)
      .reduce((sum: number, m: any) => sum + parseFloat(m.generation), 0)
      .toFixed(2);

    // For real-time, fetch current irradiance (mock or API)
    // Using OpenWeatherMap for UV as proxy, but not accurate
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY || ''}`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();
    const currentIrradiance = weatherData.uvi ? weatherData.uvi * 10 : 0; // rough estimate
    const realTimeGen = (roofArea * (efficiency / 100) * currentIrradiance * 0.1).toFixed(2); // per hour or something

    return NextResponse.json({
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      roofArea: roofArea.toFixed(2),
      maxPanels,
      maxCapacity: maxCapacity.toFixed(2),
      annualKwh: annualKwh.toFixed(2),
      annualGeneration: annualGeneration.toFixed(2),
      savings: savings.toFixed(2),
      monthlyGeneration,
      currentGeneration: currentGen,
      accumulatedEnergy: accumulated,
      realTimeGeneration: realTimeGen
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 });
  }
}