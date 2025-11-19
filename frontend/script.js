// FRONTEND dashboard.js (Google Maps + Places Autocomplete, Open-Meteo, backend call)

// ========== [MODIFIED] ERROR HANDLING ==========
// We commented this out so you can see if your Map API Key fails in the Console (F12)
/*
const originalError = console.error;
console.error = function(...args) {
  originalError.apply(console, ['[SUPPRESSED]', ...args]);
};

window.addEventListener('unhandledrejection', (e) => {
  e.preventDefault();
  return true;
});

window.addEventListener('error', (e) => {
  e.preventDefault();
  return true;
});
*/

// 4. Intercept fetch to add try-catch wrapper (Kept this for stability)
const originalFetch = window.fetch;
window.fetch = function(...args) {
  return originalFetch.apply(this, args)
    .then(response => response)
    .catch(error => {
      console.log('Fetch error caught and handled:', error);
      // Return a mock response instead of failing
      return new Response('', { status: 500 });
    });
};

// ========== PREVENT ACCIDENTAL PAGE REFRESH ==========
let showingPopup = false;

// Prevent page unload while popup is showing
window.addEventListener('beforeunload', (e) => {
  if(showingPopup){
    e.preventDefault();
    e.returnValue = '';
    return false;
  }
});

// ========== CONFIG ==========
const BACKEND_URL = "http://127.0.0.1:5000"; // change if backend hosted elsewhere
const NOMINATIM_BASE = "https://nominatim.openstreetmap.org/search";
const OPENWEATHER_BASE = "https://api.openweathermap.org/data/2.5/forecast";
const OPENWEATHER_KEY = "005eef391680c60203962f71f1cbadad";
const AQI_API_BASE = "https://api.waqi.info/feed";

// ========== CITY LIST ==========
const allCities = [
"Adilabad","Ahmadabad","Ahmednagar","Aizawl","Aizwal","Ajaigarh","Ajmer","Akola","Alangulam","Alappuzha","Alipurduar - Ii","Alipurduar-I","Almora","Alwar","Amravati","Amreli","Amritpur","Amritsar","Amroha","Anand","Anantnag","Angul","Anjaw","Anugul","Arambagh","Araria","Aravalli","Ariyallur","Ariyalur","Arwal","Ashoknagar","Ashta","Asifabad","Aspari","Aurangabad","Ausgram","Azamgarh","Babina","Badgam","Badgaon Dhasan","Bagalakote","Bagalkot","Bagalkote","Bageshwar","Bajna","Baksa","Balangir","Balasore","Ballia","Balod","Balrampur","Banas","Banaskantha","Bandipora","Bangalore","Banka","Barabanki","Baramulla","Baran","Barmer","Barnala","Barpeta","Barwani","Basirhat","Bastar","Baster","Bathinda","Beed","Begusarai","Belagavi","Belgaum","Bellary","Bemetara","Berasia","Bhadohi","Bhandara","Bharatpur","Bharuch","Bhavnagar","Bhilwara","Bhind","Bhojpur","Bhopal","Bhuvaneshwar","Biaora","Bidar","Bijapur","Bikaner","Bilaspur","Bindki","Bishnupur","Biswanath","Bokaro","Bolangir","Bongaigaon","Botad","Budalur","Budar","Budgam","Buldhana","Bundi","Burdwan","Burhanpur","Buxar","Cachar","Cannanore","Chachar","Chamarajanagar","Chamarajanagara","Chandauli","Chandigarh","Chandrapur","Charaideo","Chatra","Chevella","Chhatarpur","Chikballapur","Chikkaballa","Chikkaballapur","Chikkaballapura","Chikkamagaluru","Chitradurga","Chitrangi","Chittapur","Chittorgarh","Cholera","Churachandpur","Coimbatore","Coimbatore South","Cuddalore","Cuttack","Dadra","Dahod","Dakhina","Dakshina","Darbhanga","Darrang","Datia","Dausa","Davanagere","Davangere","Denkanikottai","Deogarh","Deoghar","Depalpur","Dev","Devbhoomi","Devbhumi","Dhalai","Dhampur","Dhamtari","Dhanbad","Dharampuri","Dharashiv","Dharmsala","Dharwad","Dhemaji","Dhenkanal","Dholpur","Dhubri","Dhule","Dhumka","Dibrugarh","Dima-Hasao","Dimapur","Dindigul","Dindori","Doda","Dudhi","Dumka","Durg","East","Ernakulum","Erode","Faridkot","Farrukhabad","Fatehgarh","Fatehpur","Fazilka","Ferozepur","Firozabad","Food","Gadag","Gadchiroli","Ganderbal","Gandhinagar","Gangajalghati","Ganganagar","Ganjam","Garhwa","Gariyaband","Gautam Budh Nagar","Gaya","Ghaziabad","Ghazipur","Gir","Giridih","Goalpara","Godda","Golaghat","Gomati","Gonda","Gondia","Gopalganj","Gopiballavpur - Ii","Gorakhpur","Gudur","Gumla","Guna","Gurdaspur","Gurgaon","Gwalior","Gyanpur","Gyaraspur","Hailakandi","Hanumakonda","Hanumangarh","Hapur","Hardoi","Harsud","Haveli","Haveri","Hills","Hnahthial","Hojai","Hoshiarpur","Hospital Bomdila","Hospital Khargone","Hospital Lab","Hospital Yingkiong","Howrah","Human","Huzur","Hyderabad","Imphal","Isagarh","Island","Itanagar Eac","Jagatsinghpur","Jagityal","Jahanabad","Jail Orai","Jaintia","Jaisalmer","Jaisinghnagar","Jajapur","Jajpur","Jalaun","Jalgaon","Jalna","Jalpaiguri","Jamnagar","Jamtara","Jamui","Janjgir","Janjgir-","Janjgir-Champa","Japanese","Jashpur","Jaunpur","Jewargi","Jhabua","Jhajjar","Jhalawar","Jhansi","Jhargram","Jharsuguda","Jhunjhunu","Jiribam","Jobat","Jodhpur","Jogulamba","Jorhat","Joura","Junagadh","Junagarh","Kabirdham","Kaimganj","Kaithal","Kalaburagi","Kalaburgi","Kalahandi","Kalburgi","Kaliachak - Ii","Kallakurichi","Kamareddy","Kameng","Kamrup","Kamrup-M","Kamrup-R","Kandhamal","Kangpokpi","Kangra","Kannauj","Kannur","Kanyakumari","Kapurthala","Karad","Karahal","Karaikal","Karaikkudi","Karauli","Karbi","Karbi-","Karera","Karikal","Karimganj","Karimnagar","Karnal","Kasaragod","Kathua","Katihar","Katni","Kaushambi","Kawardha","Kendujhar","Keonjhar","Khagaria","Khammam","Khandwa","Khargone","Khargone Nagar","Kheda","Khilchipur","Khorda","Khordha","Khujner","Khunti","Khurda","Kiphire","Kishtwar","Kodagu","Koderma","Kohima","Kolapur","Kolar","Kolasib","Kolhapur","Kollam","Konaseema","Koraput","Korba","Kotagiri","Kothagudem","Kozhikode","Krishnagiri","Kulgam","Kumbakonam","Kumuram","Kundam","Kupwara","Kurda","Kurinjipadi","Kurukshetra","Kushinagar","Ladakh","Lakhimpur","Lalitpur","Latehar","Latur","Lawngtlai","Leh","Leporiang Circle","Lohardaga","Longding Hq","Longleng","Lucknow","Ludhiana","Lumla District Tawang","Lunglei","Machhlishahr","Madhepura","Madhubani","Madurai","Mahabubabad","Maharajganj","Mahasamund","Mahe","Mahesana","Maihar","Mainpuri","Majholi","Majuli","Malappuram","Malkangiri","Mamit","Manapparai","Manasa","Mandla","Mandsaur","Mandya","Mangawan","Mansa","Mariahu","Marigaon","Mayiladuthurai","Mayurbhanj","Medak","Medinipur","Meerut","Mehsana","Mewat","Mirzapur","Modinagar","Moga","Mokokchung","Morbi","Moth","Muktsar","Multai","Multiple","Mungeli","Munger","Muzaffar Nagar","Muzaffarpur","Mysore","Mysuru","Nabarangpur","Nadu","Nagaon","Nagapatinam","Nagarkurnool","Nagaur","Nagpur","Naharlagun Eac","Nainital","Nalanda","Nalbari","Nalgonda","Namakkal","Nandurbar","Narayanpet","Narmada","Nashik","Nathavaram","Navsari","Nawada","Nawanshahr","Nawapara","Nayagarh","Nirmal","Niwari","Niwas","Nizamabad","Noney","Nuapada","Nuh","Of Himachal Pradesh","Osmanabad","Pakaur","Pakur","Pakyong","Palakkad","Palamu","Palghar","Palwal","Panch","Panchkula","Panchmahal","Panchsheel Nagar","Pandhana","Pangchao Sdo","Panipat","Papum Pare","Paramakudi","Parbhani","Pashchim","Patan","Pathankot","Patiala","Pauri","Pawai","Pendra","Peren","Phek","Pithoragarh","Pondicherry","Poonch","Porbandar","Porsa","Pratapgarh","Public Health Lab","Puducherry","Pudukottai","Pulwama","Pune","Puri","Purnia","Purulia","Radhapuram","Raebareli","Raghurajnagar Nagareey","Raichur","Raigarh","Raipur","Rajgarh","Rajkot","Rajouri","Rajpur","Ramanagara","Ramanathapuram","Ramban","Ramgarh","Ranjana","Ratnagiri","Rayagada","Rewa","Ri-","Ri-Bhoi","Rohtas","Roing","Roopnagar","Rudra","Rudraprayag","Rupnagar","Sabalgarh","Sabarkantha","Sagar","Saharanpur","Saharsa","Sahebganj","Sahibganj","Samastipur","Samba","Sambalpur","Sangareddy","Sangli","Sangrur","Santhipuram","Saraikela","Saran","Sas","Satwas","Sawai","Sehore","Semaria","Sepahijala","Seppa Hq","Serchhip","Sheikhpura","Shekhpura","Sheohar","Shimoga","Shivamogga","Sholapur","Shujalpur","Sibasagar","Sibsagar","Sikanderpur","Sikar","Simdega","Simlapal","Sindhudurg","Singrauli","Sirmour","Sirohi","Sirsa","Sitamarhi","Sivagangai","Sivasagar","Siwan","Somandepalle","Sonbhadra","Sonepat","Sonepur","Sonipat","Sonitpur","Sonkatch","Soreng","Srikalahasti","Srinagar","Srirangam","Subarnapur","Sukma","Sundargarh","Supaul","Surajpur","Surat","Surendranagar","Surguja","Surveillance","Tamenglong","Tamulpur","Tengakhat","Tenkasi","Thane","Thirupathur","Thiruppathur","Thiruvallur","Thiruvananthapuram","Thiruvannamalai","Thoubal","Tinsukia","Tiruchirappalli","Tirupathur","Tiruvannamalai","Tonk","Trichy Corporation","Trivandrum","Tuensang","Tumakur","Tumakuru","Tumkur","Tuticorin","Udaipur","Udaipura","Udhampur","Udupi","Uduppi","Ukhrul","Unakoti","Unnao","Uttara","Uttarkashi","Vadodara","Vaishali","Valsad","Vellore","Vijayanaga","Vijayanagar","Vijayanagara","Vijayapur","Vijayapura","Vijaypur","Vikarabad","Vikravandi","Villupuram","Virudhunagar","Virudhunagar Sivakasi","Wanaparthy","Warangal","Wardha","Washim","Watrap","Wayand","Weast","Yadadri","Yadamarri","Yadgir","Yadgiri","Yamuna","Yamunanaga","Yamunanagar","Yavatmal","Ziro Hq","Zunheboto"
];

// ========== DOM refs ==========
const dropdown = document.getElementById('cityDropdown');
const searchBar = document.getElementById('searchBar');
const currentLocBtn = document.getElementById('currentLocBtn');
const weatherInfo = document.getElementById('weatherInfo');
const diseaseTimeline = document.getElementById('diseaseTimeline');
const searchSuggestions = document.getElementById('searchSuggestions');

// ========== Google Maps placeholders ==========
let map = null;
let gmarker = null;
let autocomplete = null;
let selectedCity = null;
let selectedCoords = null;

// ========== Populate dropdown ==========
(function populate(){
  const unique = Array.from(new Set(allCities)).sort((a,b)=> a.localeCompare(b));
  for(const c of unique){
    const opt = document.createElement('option');
    opt.value = c; opt.text = c;
    dropdown.appendChild(opt);
  }
})();

// ========== Search suggestions ==========
searchBar.addEventListener('input', ()=>{
  const q = searchBar.value.trim().toLowerCase();
  
  if(!q){
    searchSuggestions.classList.remove('show');
    return;
  }
  
  // Filter cities that match the search query
  const matches = allCities.filter(city => city.toLowerCase().includes(q));
  
  if(matches.length === 0){
    searchSuggestions.classList.remove('show');
    return;
  }
  
  // Show suggestions (max 10)
  searchSuggestions.innerHTML = '';
  matches.slice(0, 10).forEach(city => {
    const item = document.createElement('div');
    item.className = 'search-suggestion-item';
    item.textContent = city;
    item.addEventListener('click', () => {
      searchBar.value = city;
      searchSuggestions.classList.remove('show');
      dropdown.value = city;
      handleSelectCity(city);
    });
    searchSuggestions.appendChild(item);
  });
  
  searchSuggestions.classList.add('show');
});

// Close suggestions when clicking outside
document.addEventListener('click', (e) => {
  if(e.target !== searchBar){
    searchSuggestions.classList.remove('show');
  }
});

// ========== City coordinates (cached for closest city lookup) ==========
let cityCoords = {}; // will be populated lazily

// ========== Geocode function (Nominatim fallback) ==========
async function geocodeCity(city){
  try{
    const q = encodeURIComponent(`${city}, India`);
    const url = `${NOMINATIM_BASE}?q=${q}&format=json&limit=1&addressdetails=0`;
    const res = await fetch(url, {cache:'no-store'});
    const arr = await res.json();
    if(!arr || arr.length===0) return null;
    return {lat: parseFloat(arr[0].lat), lon: parseFloat(arr[0].lon)};
  }catch(e){
    console.warn('geocode error',e);
    return null;
  }
}

// ========== Reverse geocode function (get city name from coords) ==========
async function reverseGeocodeToCity(lat, lon){
  try{
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
    const res = await fetch(url, {cache:'no-store'});
    const data = await res.json();
    if(!data || !data.address) return null;
    
    // Try to extract city/town/village name
    const address = data.address;
    const cityName = address.city || address.town || address.village || address.county || address.region;
    
    if(!cityName) return null;
    
    // Try to match with our city list
    const matched = allCities.find(c => c.toLowerCase() === cityName.toLowerCase());
    if(matched) return {city: matched, coords: {lat, lon}};
    
    // If no exact match, geocode the city to get official coords
    const coordsResult = await geocodeCity(cityName);
    if(coordsResult) return {city: cityName, coords: coordsResult};
    
    return null;
  }catch(e){
    console.warn('reverse geocode error', e);
    return null;
  }
}

// ========== Open-Meteo 7-day forecast ==========
async function fetch7Day(lat, lon){
  try{
    const url = `${OPENWEATHER_BASE}?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_KEY}&units=metric`;
    const res = await fetch(url);
    if(!res.ok) return null;
    const data = await res.json();
    
    // OpenWeather returns 5-day forecast in 3-hour intervals
    // Group by day and aggregate to get daily max/min/rain/humidity
    const daily = {
      time: [],
      temperature_2m_max: [],
      temperature_2m_min: [],
      precipitation_sum: [],
      relative_humidity_2m_max: []
    };
    
    const dayMap = {};
    
    data.list.forEach(forecast => {
      const date = forecast.dt_txt.split(' ')[0]; // YYYY-MM-DD
      if(!dayMap[date]) {
        dayMap[date] = {
          temps: [],
          humidity: [],
          rain: 0
        };
      }
      
      dayMap[date].temps.push(forecast.main.temp);
      dayMap[date].humidity.push(forecast.main.humidity);
      
      // Rain in mm (OpenWeather gives 3h rain in mm)
      if(forecast.rain && forecast.rain['3h']) {
        dayMap[date].rain += forecast.rain['3h'];
      }
    });
    
    // Convert to arrays (max 7 days)
    Object.keys(dayMap).sort().slice(0, 7).forEach(date => {
      const day = dayMap[date];
      daily.time.push(date);
      daily.temperature_2m_max.push(Math.max(...day.temps));
      daily.temperature_2m_min.push(Math.min(...day.temps));
      daily.precipitation_sum.push(day.rain);
      daily.relative_humidity_2m_max.push(Math.max(...day.humidity));
    });
    
    return daily;
  }catch(e){
    console.warn('openweather forecast error', e);
    return null;
  }
}

// ========== Backend predictions ==========
async function getBackendPreds(city, lat, lon){
  try{
    const c = encodeURIComponent(city);
    const url = `${BACKEND_URL}/predict_disease?city=${c}&lat=${lat}&lon=${lon}`;
    const res = await fetch(url);
    if(!res.ok) {
      const txt = await res.text().catch(()=>res.statusText);
      throw new Error(`backend ${res.status} ${txt}`);
    }
    return await res.json();
  }catch(e){
    console.error('backend error', e);
    return null;
  }
}

// ========== Fetch AQI data ==========
async function fetchAQI(lat, lon){
  try{
    const url = `${AQI_API_BASE}/?token=demo&lat=${lat}&lon=${lon}`;
    const res = await fetch(url);
    if(!res.ok) return null;
    const data = await res.json();
    if(data.status === 'ok' && data.data){
      return {
        aqi: data.data.aqi,
        pm25: data.data.iaqi?.pm25?.v || null,
        pm10: data.data.iaqi?.pm10?.v || null,
        o3: data.data.iaqi?.o3?.v || null
      };
    }
    return null;
  }catch(e){
    console.warn('AQI fetch error', e);
    return null;
  }
}

// ========== Render helpers ==========
function showWeatherLoading(){ 
  weatherInfo.innerHTML = '<div class="mono-text">LOADING ATMOSPHERIC DATA...</div>'; 
}
function showPredLoading(){ 
  diseaseTimeline.innerHTML = '<div class="mono-text">COMPUTING VECTORS...</div>'; 
}

function renderWeather(daily, aqi){
  if(!daily){ weatherInfo.innerHTML = '<p style="color:#ff3333">DATA UNAVAILABLE</p>'; return; }
  const t = ((daily.temperature_2m_max[0] + daily.temperature_2m_min[0]) / 2).toFixed(1);
  const hum = daily.relative_humidity_2m_max[0];
  const rain = daily.precipitation_sum[0].toFixed(1);
  
  // Determine AQI status and color
  let aqiText = 'N/A';
  let aqiColor = '#555';
  if(aqi && aqi.aqi){
    const aqiValue = aqi.aqi;
    if(aqiValue <= 50){
      aqiText = `${aqiValue} - GOOD`;
      aqiColor = '#ccff00';
    }else if(aqiValue <= 100){
      aqiText = `${aqiValue} - MODERATE`;
      aqiColor = '#f59e0b';
    }else{
      aqiText = `${aqiValue} - HAZARDOUS`;
      aqiColor = '#ff3333';
    }
  }
  
  weatherInfo.innerHTML = `
    <div class="weather-row"><div>TEMP</div><div><strong>${t}°C</strong></div></div>
    <div class="weather-row"><div>HUMIDITY</div><div><strong>${hum}%</strong></div></div>
    <div class="weather-row"><div>PRECIPITATION</div><div><strong>${rain} mm</strong></div></div>
    <div class="weather-row"><div>AQI</div><div style="color:${aqiColor}"><strong>${aqiText}</strong></div></div>
  `;
}

function renderPreds(preds){
  if(!preds || !Array.isArray(preds)){
    diseaseTimeline.innerHTML = '<p style="color:#ff3333">NO VECTORS DETECTED</p>';
    return;
  }
  diseaseTimeline.innerHTML = '';
  preds.forEach(day=>{
    const card = document.createElement('div');
    card.className = 'disease-card';
    const top = (day.top_diseases && day.top_diseases[0]) || {disease:'UNKNOWN', confidence:0};
    const conf = Number(top.confidence) || 0;
    
    // Brutalist risk badges
    let riskClass = 'low';
    if(conf > 60) riskClass = 'high';
    else if(conf > 30) riskClass = 'medium';

    card.innerHTML = `
      <div class="disease-header">
        <div class="disease-name">${top.disease.toUpperCase()}</div>
        <div class="risk-badge ${riskClass}">${conf}% PROB.</div>
      </div>
      <div style="font-size:0.7rem;color:#888;margin-top:5px;">DATE: ${day.date}</div>
    `;
    diseaseTimeline.appendChild(card);
  });
}

// ========== Main selection handler ==========
async function handleSelectCity(city, coordsArg){
  try {
    if(!city) return alert('SELECT SECTOR FIRST');

    showWeatherLoading(); showPredLoading();

    let coords = coordsArg || null;
    if(!coords){
      coords = await geocodeCity(city);
      if(!coords) { weatherInfo.innerHTML = `<p style="color:#ff3333">COORDINATES LOST: ${city}</p>`; diseaseTimeline.innerHTML=''; return; }
    }

    // set marker & view (Google Maps)
    if(!map){
      console.warn('Map initializing...');
      return;
    }
    if(!gmarker) gmarker = new google.maps.Marker({map: map});
    gmarker.setPosition({lat: coords.lat, lng: coords.lon});
    gmarker.setMap(map);
    map.setCenter({lat: coords.lat, lng: coords.lon});
    map.setZoom(12);

    // Track selected city and coords
    selectedCity = city;
    selectedCoords = coords;

    // Update dropdown to show selected city
    dropdown.value = city;
    
    // If no exact match, try to find closest matching city in dropdown
    if(!dropdown.value){
      const cityLower = city.toLowerCase();
      for(let opt of dropdown.options){
        if(opt.value.toLowerCase() === cityLower){
          dropdown.value = opt.value;
          break;
        }
      }
    }

    // fetch weather & backend
    const [daily, backendResp, aqiData] = await Promise.all([
      fetch7Day(coords.lat, coords.lon),
      getBackendPreds(city, coords.lat, coords.lon),
      fetchAQI(coords.lat, coords.lon)
    ]);

    renderWeather(daily, aqiData);
    if(!backendResp || !backendResp.predictions) {
      diseaseTimeline.innerHTML = '<p style="color:#ff3333">AI MODEL OFFLINE</p>';
      return;
    }
    renderPreds(backendResp.predictions);
  } catch(err) {
    console.log('Error in handleSelectCity:', err);
  }
}

// ========== UI hooks ==========
currentLocBtn.addEventListener('click', ()=> {
  // Get user's current location using geolocation API
  currentLocBtn.disabled = true;
  currentLocBtn.textContent = 'SCANNING...';
  
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        if(map){
          map.setCenter({lat, lng: lon});
          map.setZoom(13);
        }
        
        if(gmarker){
          gmarker.setPosition({lat, lng: lon});
        }
        
        reverseGeocodeToCity(lat, lon).then(cityResult => {
          if(cityResult){
            const cityName = typeof cityResult === 'string' ? cityResult : (cityResult.city || cityResult);
            selectedCity = cityName;
            selectedCoords = {lat, lon};
            dropdown.value = cityName;
            handleSelectCity(cityName, {lat, lon});
          }else{
            const coordString = `LAT: ${lat.toFixed(4)}, LON: ${lon.toFixed(4)}`;
            selectedCity = coordString;
            selectedCoords = {lat, lon};
            handleSelectCity(coordString, {lat, lon});
          }
          currentLocBtn.disabled = false;
          currentLocBtn.textContent = 'LOCATE';
        }).catch(err => {
          console.log('Error getting city name:', err);
          currentLocBtn.disabled = false;
          currentLocBtn.textContent = 'LOCATE';
        });
      },
      (error) => {
        console.log('Geolocation error:', error);
        alert('SIGNAL LOST. ENABLE GPS.');
        currentLocBtn.disabled = false;
        currentLocBtn.textContent = 'LOCATE';
      }
    );
  }else{
    alert('GPS MODULE NOT FOUND');
    currentLocBtn.disabled = false;
    currentLocBtn.textContent = 'LOCATE';
  }
});

// ========== Dropdown city selection ==========
dropdown.addEventListener('change', async ()=> {
  const city = dropdown.value;
  if(!city) return;
  
  const coords = await geocodeCity(city);
  if(coords){
    selectedCity = city;
    selectedCoords = coords;
    
    if(map){
      map.setCenter({lat: coords.lat, lng: coords.lon});
      map.setZoom(13);
    }
    
    if(gmarker){
      gmarker.setPosition({lat: coords.lat, lng: coords.lon});
    }
    
    handleSelectCity(city, coords);
  }else{
    alert(`COORDINATES NOT FOUND: ${city}`);
  }
});

searchBar.addEventListener('keypress', (e)=>{
  if(e.key==='Enter'){
    e.preventDefault();
    for(const opt of dropdown.options){
      if(!opt.hidden){ dropdown.value = opt.value; handleSelectCity(opt.value); break; }
    }
  }
});

// ========== Report Instance Modal ==========
const reportBtn = document.getElementById('reportBtn');
const reportModal = document.getElementById('reportModal');
const reportClose = document.querySelector('.modal-close');
const reportCancel = document.getElementById('reportCancel');
const reportSubmit = document.getElementById('reportSubmit');
const reportDisease = document.getElementById('reportDisease');
const otherDiseaseGroup = document.getElementById('otherDiseaseGroup');
const reportLocation = document.getElementById('reportLocation');
const reportMessage = document.getElementById('reportMessage');

reportBtn.addEventListener('click', ()=>{
  if(!selectedCity || !selectedCoords){
    alert('SELECT A SECTOR OR ENABLE GPS FIRST');
    return;
  }
  reportLocation.value = selectedCity;
  reportModal.classList.add('show');
});

reportDisease.addEventListener('change', ()=>{
  if(reportDisease.value === 'Other'){
    otherDiseaseGroup.style.display = 'block';
  }else{
    otherDiseaseGroup.style.display = 'none';
  }
});

reportClose.addEventListener('click', ()=>{
  reportModal.classList.remove('show');
});

reportCancel.addEventListener('click', ()=>{
  reportModal.classList.remove('show');
});

reportModal.addEventListener('click', (e)=>{
  if(e.target === reportModal){
    reportModal.classList.remove('show');
  }
});

reportSubmit.addEventListener('click', async (e)=>{
  e.preventDefault();
  e.stopPropagation();
  
  reportSubmit.disabled = true;
  reportSubmit.style.opacity = '0.6';
  reportSubmit.textContent = 'TRANSMITTING...';
  
  const disease = reportDisease.value === 'Other' ? document.getElementById('otherDisease').value : reportDisease.value;
  const severity = document.getElementById('reportSeverity').value;
  const symptoms = document.getElementById('reportSymptoms').value;

  if(!disease || !severity){
    reportMessage.style.display = 'block';
    reportMessage.textContent = 'INCOMPLETE DATA. SPECIFY PATHOGEN & SEVERITY.';
    reportMessage.style.color = '#ff3333';
    
    reportSubmit.disabled = false;
    reportSubmit.style.opacity = '1';
    reportSubmit.textContent = 'UPLOAD DATA';
    return;
  }

  try{
    const url = `${BACKEND_URL}/report_disease`;
    
    const payload = {
      city: selectedCity,
      lat: selectedCoords.lat,
      lon: selectedCoords.lon,
      disease,
      severity,
      symptoms
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
      signal: controller.signal,
      keepalive: true
    });
    
    clearTimeout(timeoutId);
    const responseData = await res.json();
    
    if(res.ok && responseData.success){
      reportSubmit.disabled = true;
      showThankYouPopup();
    }else{
      reportMessage.style.display = 'block';
      reportMessage.textContent = 'UPLOAD FAILED: ' + (responseData.error || 'UNKNOWN ERROR');
      reportMessage.style.color = '#ff3333';
      reportSubmit.disabled = false;
      reportSubmit.style.opacity = '1';
      reportSubmit.textContent = 'UPLOAD DATA';
    }
  }catch(e){
    console.error('report error', e);
    reportMessage.style.display = 'block';
    reportMessage.textContent = 'TRANSMISSION ERROR';
    reportMessage.style.color = '#ff3333';
    reportSubmit.disabled = false;
    reportSubmit.style.opacity = '1';
    reportSubmit.textContent = 'UPLOAD DATA';
  }
});

// ========== [MODIFIED] Google Maps initialization (Dark Mode) ==========
function initAutocomplete(){
  try {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 22.9734, lng: 78.6569},
      zoom: 5,
      disableDefaultUI: true, // Minimalist UI
      backgroundColor: '#050505',
      // BRUTALIST DARK THEME STYLE
      styles: [
        { elementType: "geometry", stylers: [{ color: "#212121" }] },
        { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
        { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
        { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
        { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] }
      ]
    });

    gmarker = new google.maps.Marker({map: map});

    map.addListener('click', async (event) => {
      const lat = event.latLng.lat();
      const lon = event.latLng.lng();
      
      showWeatherLoading();
      showPredLoading();
      
      const result = await reverseGeocodeToCity(lat, lon);
      if(!result){
        weatherInfo.innerHTML = '<p style="color:#ff3333">UNMAPPED SECTOR</p>';
        diseaseTimeline.innerHTML = '';
        return;
      }
      
      const {city, coords} = result;
      selectedCity = city;
      selectedCoords = coords;
      
      if(Array.from(dropdown.options).some(o=>o.value===city)) dropdown.value = city;
      if(!gmarker) gmarker = new google.maps.Marker({map: map});
      gmarker.setPosition({lat: coords.lat, lng: coords.lon});
      gmarker.setMap(map);
      map.setCenter({lat: coords.lat, lng: coords.lon});
      map.setZoom(10);
      
      const [daily, backendResp, aqiData] = await Promise.all([
        fetch7Day(coords.lat, coords.lon),
        getBackendPreds(city, coords.lat, coords.lon),
        fetchAQI(coords.lat, coords.lon)
      ]);

      renderWeather(daily, aqiData);
      if(!backendResp || !backendResp.predictions) {
        diseaseTimeline.innerHTML = '<p style="color:#ff3333">AI MODEL OFFLINE</p>';
        return;
      }
      renderPreds(backendResp.predictions);
    });

    autocomplete = new google.maps.places.Autocomplete(searchBar, {
      types: ['(cities)'], componentRestrictions: {country: 'in'}
    });
    
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if(!place || !place.geometry){
        const q = searchBar.value.trim();
        if(q) handleSelectCity(q);
        return;
      }
      const lat = place.geometry.location.lat();
      const lon = place.geometry.location.lng();
      const name = place.name || searchBar.value;
      if(Array.from(dropdown.options).some(o=>o.value===name)) dropdown.value = name;
      handleSelectCity(name, {lat, lon});
    });

  } catch(err) {
    console.log('Error in initAutocomplete:', err);
  }
}

window.initAutocomplete = initAutocomplete;

// ========== Thank You Popup Function ==========
function showThankYouPopup(){
  showingPopup = true;
  
  const popup = document.createElement('div');
  popup.id = 'thankYouPopup';
  popup.className = 'modal show'; // Reusing modal class for style
  popup.innerHTML = `
    <div class="modal-content" style="text-align:center; padding: 40px;">
      <div style="font-size: 3rem; color: #ccff00; margin-bottom:20px;">✓</div>
      <h2 style="color:#e0e0e0">DATA UPLOADED</h2>
      <p style="color:#888; margin-top:10px;">CONTRIBUTION LOGGED TO NEURAL NET.</p>
      <button class="btn-primary" style="margin-top:20px;" onclick="closeThankyouAndReset()">CLOSE</button>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  setTimeout(() => {
    closeThankyouAndReset();
  }, 3000);
}

function closeThankyouAndReset(){
  const popup = document.getElementById('thankYouPopup');
  if(popup && popup.parentElement){
    popup.classList.remove('show');
    setTimeout(() => {
      if(popup.parentElement) popup.remove();
      showingPopup = false; 
      
      reportModal.classList.remove('show');
      reportMessage.style.display = 'none';
      
      reportDisease.value = '';
      document.getElementById('otherDisease').value = '';
      document.getElementById('reportSeverity').value = '';
      document.getElementById('reportSymptoms').value = '';
      otherDiseaseGroup.style.display = 'none';
      
      reportSubmit.disabled = false;
      reportSubmit.style.opacity = '1';
      reportSubmit.textContent = 'UPLOAD DATA';
    }, 300);
  }
}