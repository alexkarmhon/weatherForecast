const searcForm = document.querySelector('.js-search');
const addBtn = document.querySelector('.js-add');
const list = document.querySelector('.js-list');
const formInputsContainer = document.querySelector('.js-form-container');

function handlerAddBtn() {
  const markup = '<input type="text" name="country">';
  formInputsContainer.insertAdjacentHTML('beforeend', markup);
}

function handlerFormSubmit(e) {
  e.preventDefault();

  const data = new FormData(e.currentTarget)
  const arr = data.getAll('country').filter(item => item).map(item=> item.trim());
  
  getCountries(arr)
    .then(async (resp) => {
      const capitals = resp.map(({ capital }) => capital[0]);
      const weatherService = await getWeather(capitals);
      list.innerHTML = createMarkup(weatherService);
    })
    .catch(console.log)
    .finally(() => {
      searcForm.reset();
      formInputsContainer.innerHTML = '<input type="text" name="country">';
    });
}

function createMarkup(arr) {
  return arr.map(({ current:{condition:{text, icon}, temp_c} , location:{name, country} }) => `
  <li>
  <div>
    <h2>${name}</h2>
    <h3>${country}</h3>
    <img src="${icon}" alt="${text}">
    <p>${text}</p>
    <p>${temp_c}C</p>
  </div>
</li>
  `).join('');
}

async function getCountries(arr) {
  const resps = arr.map(async item => {
    const resp = await fetch(`https://restcountries.com/v3.1/name/${item}`);
    if (!resp.ok) { throw new Error() };
    return resp.json();
  });
  
  const data = await Promise.allSettled(resps);
  const countryObj = data
    .filter(({ status }) => status === "fulfilled")
    .map(({ value }) => value[0]);
  
  return countryObj;
}

async function getWeather(arr) {
  const BASE_URL = 'http://api.weatherapi.com/v1';
  const API_KEY = '19b913a3fc2b468f940161451241801';

  const resps = arr.map(async (city) => {
    const params = new URLSearchParams({
      key: API_KEY,
      q: city,
      lang: 'uk'
    })

    const resp = await fetch(`${BASE_URL}/current.json?${params}`);
    if (!resp.ok) { throw new Error() };
    return resp.json();
  });

  const data = await Promise.allSettled(resps);
  const objs = data
    .filter(({ status }) => status === "fulfilled")
    .map(({ value }) => value);
  
  return objs;
}

addBtn.addEventListener('click', handlerAddBtn);
searcForm.addEventListener('submit', handlerFormSubmit);