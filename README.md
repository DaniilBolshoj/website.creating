# Solar Potential and Savings Calculator

This website calculates real-time solar energy data and potential for a specific address using actual roof information.

## Features

- Address-based location with actual roof data from Google Solar API
- Real-time energy generation estimation
- Monthly and accumulated energy history
- Seasonal energy calculator
- Building details: roof area, max panels, solar potential

## Setup

1. Get API keys:
   - Google Solar API: https://developers.google.com/solar (requires billing)
   - OpenWeatherMap API: https://openweathermap.org/api (free tier available)

2. Add keys to `.env.local`:
   ```
   GOOGLE_API_KEY=your_key
   OPENWEATHER_API_KEY=your_key
   ```

3. Install dependencies: `npm install`
4. Run: `npm run dev`
5. Open http://localhost:3000

## APIs Used

- Nominatim for geocoding
- Google Solar API for building/roof data
- PVGIS for monthly irradiation
- OpenWeatherMap for real-time irradiance proxy

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
