import axios from 'axios';

const weather = axios.create({
    baseURL: "https://api.openweathermap.org/data/2.5"
})

export default weather;

