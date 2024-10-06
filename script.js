const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");

const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const apiErrorContainer = document.querySelector(".api-error-container");


let currentTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
currentTab.classList.add("current-tab");
getfromSessionStorage();


function switchTab(clickedTab) {
    apiErrorContainer.classList.remove("active");
    if(clickedTab !== currentTab) {
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")) {
            // Kya search form wala container is invisble, if yes then make it visible 
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {
            // Mai phele search wale tab par tha, Ab Your weather visible karna hai
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // Ab mai your weather tab mai agya hu, toh weather bhi display karna padega, so let's check local storage first for coordinates, 
            // If we have saved them there
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click",() => {
    // Pass clicked tab as input parameter 
    switchTab(userTab);
});
searchTab.addEventListener("click",() => {
    // Pass clicked tab as input parameter 
    switchTab(searchTab);
});

// User Weather Handling
const messageText = document.querySelector("[data-messageText]");
const apiErrorImg = document.querySelector("[data-notFoundImg]");
const apiErrorMessage = document.querySelector("[data-apiErrorText]");
const apiErrorBtn = document.querySelector("[data-apiErrorBtn]");

// Check if coordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates) {
        grantAccessContainer.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const {lat, lon} = coordinates;
    // Make GrantAccess Invisible
    grantAccessContainer.classList.remove("active");
    // Make LoadingScreen Visible 
    loadingScreen.classList.add("active");
    // Calling API 
    try { 
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        // console.log("User - Api Fetch Data", data); 
        if(!data.sys){
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(error) {
        // console.log("User - Api Fetch Error", error.message);
        loadingScreen.classList.remove("active");
        apiErrorContainer.classList.add("active");
        apiErrorImg.style.display = "none";
        apiErrorMessage.innerText = `Error: ${error?.message}`;
        apiErrorBtn.addEventListener("click", fetchUserWeatherInfo);
    }
}

function renderWeatherInfo(weatherInfo) {
    // Fetching the Elements 
    // console.log("Weather Info", weatherInfo);
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // Fetch values from weatherInfo object and put it in UI elements 
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
} 

function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    }
    else{
        // Show an alert for no geolocation support available
        grantAccessButton.style.display = "none";
        messageText.innerText = "Geolocation is not supported by this browser.";
    }
}

// Store User Coordinates
function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

// Handle any Errors 
function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      messageText.innerText = "You denied the request for Geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
      messageText.innerText = "Location information is unavailable.";
      break;
    case error.TIMEOUT:
      messageText.innerText = "The request to get user location timed out.";
      break;
    case error.UNKNOWN_ERROR:
      messageText.innerText = "An unknown error occurred.";
      break;
  }
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    let cityName = searchInput.value;
    if(cityName === "") {
        return;
    }
    else {
        fetchSearchWeatherInfo(cityName);
        cityName = "";
    }
});

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    apiErrorContainer.classList.remove("active");

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        // console.log("Search - Api Fetch Data", data);
        if(!data.sys){
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(error) {
        // console.log("Search - Api Fetch Error", error.message);
        loadingScreen.classList.remove("active");
        apiErrorContainer.classList.add("active");
        apiErrorMessage.innerText = `${error?.message}`;
        apiErrorBtn.style.display = "none";
    }
}

