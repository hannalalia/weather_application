import axios from 'axios';

const weather = axios.create({
    baseURL: "https://api.geoapify.com/v1/geocode/"
})
export default weather;

