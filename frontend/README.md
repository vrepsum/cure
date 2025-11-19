# CURE - Community Unified Risk Evaluation

A responsive web platform that predicts potential disease outbreaks based on environmental data, weather conditions, and community symptom reports.

## 🌟 Features

- **Interactive Google Maps Integration** - Search and explore any location worldwide
- **Auto Location Detection** - Automatically requests and uses your live location on page load
- **Manual Location Access** - "My Location" button to re-center map on your current position
- **Real-time Weather Data** - Automatic fetching of temperature, humidity, and conditions
- **Air Quality Monitoring** - Live AQI data with health impact assessment
- **Disease Risk Predictions** - ML-ready heuristic model for outbreak predictions
- **Community Reporting** - Submit symptom reports with location data
- **Visual Risk Overlays** - Color-coded map zones showing disease risk levels
- **Case Count Analysis** - View reported disease cases within 10km radius of any location
- **Place Name Display** - Automatic location name resolution for selected areas
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## 🎯 How to Use

### Accessing Your Precise Location
1. **On first load**, a modal will appear asking to "Enable Precise Location"
2. Click **"Allow Precise Location"** button
3. Your browser will show a popup: **"Allow CURE to access your location?"**
4. Click **"Allow"** to enable GPS-level accuracy
5. The system will show accuracy information (e.g., "±15m")
6. Map centers on your exact coordinates with high zoom level

**Important Notes:**
- ✓ Uses GPS for maximum accuracy (typically 5-20 meters)
- ✓ Requests fresh location data (not cached)
- ✓ Waits up to 15 seconds for precise coordinates
- ✓ Shows accuracy meter so you know precision level
- ✓ Works best outdoors with clear GPS signal

**If Location Access Fails:**
- Enable device location services (Settings → Privacy → Location)
- Grant browser location permissions
- Ensure GPS is enabled
- Check internet connection
- Try the "📍 My Location" button again

### Exploring Disease Risk
1. Click anywhere on the map or search for a location
2. View the **place name** automatically displayed
3. See **reported cases within 10km radius** categorized by disease type
4. Check real-time weather and air quality data in the sidebar
5. Review disease predictions with risk levels and reasoning
6. Check the colored overlay on the map for visual risk assessment

### Reporting Symptoms
1. Click the "📍 Report Instance" button
2. Fill in your symptoms and severity level
3. Optionally allow location access for precise reporting
4. Submit the report to add it to the community map

### Searching Locations
1. Type a location name in the search box
2. Press Enter or click "Search"
3. The map will zoom to that location and fetch relevant data

## 📄 License

This project is open source and available for educational and non-commercial use.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to improve the disease prediction logic, add new features, or enhance the UI/UX.

This platform is for informational and educational purposes only. Disease predictions are based on environmental factors and should not replace professional medical advice. Always consult healthcare professionals for medical concerns.

---

**Built with ❤️ for community health awareness**
