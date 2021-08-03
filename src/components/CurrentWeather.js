import React, {useState,useEffect,useRef} from 'react'
//API Urls
import map from '../utils/axios/GeocodeURL'
import axios from '../utils/axios/OpenWeatherURL'
//Material UI
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { makeStyles } from '@material-ui/core/styles';
import { Alert} from '@material-ui/lab';
import Tooltip from '@material-ui/core/Tooltip';
import LocationOnIcon from '@material-ui/icons/LocationOn';


const useStyles = makeStyles((theme) => ({
  customScrollbar: {
      "overflowX":"scroll",
      "&::-webkit-scrollbar": {
         display:"none"          
      },
      "&::-webkit-scrollbar-track": {
        background: "#f1f1f1",
        borderRadius:"2px" 
      },       
      "&::-webkit-scrollbar-thumb": {
        background: "#888",       
      },
      "&::-webkit-scrollbar-thumb:hover": {
        background: "#555",
        borderRadius:"2px"   
      }
  },
  btn:{
    background:"#2196f3",
    color:"white"
  },
  textbox:{
    outline:"none",
    width:"50vw", 
    height:"1.5rem",
    border: 0,
    borderBottom:".1rem solid #2196f3",
    fonSize:"1rem"
  },
  alert:{
    justifyContent:"center",
    alignItems:"center",
    fontSize:"1rem"
  },
  datalist:{
    
  },
  title:{
    display:"block",
    textAlign:"center",
    color:"rgba(55,71,79,1)"
  },
  currentWeatherRight:{
    color:"#ffebee",
    borderRadius:"0 1rem 0 0", 
    [theme.breakpoints.down('sm')]:{
      borderRadius:"1rem 1rem 0 0"
    }
  },
  currentWeatherLeft:{
    color:"#ffebee",
    borderRadius:"1rem 0 0 0",
    [theme.breakpoints.down('sm')]:{
      borderRadius:"1rem 1rem 0 0"
    }
  }
}));

function CurrentWeather() {
  const classes = useStyles();
  const [location,setLocation] = useState('');
  const [title, setTitle] = useState('Manila City, Philippines')
  const [lat,setLat] = useState('14.59');
  const [lon,setLon] = useState('120.98');
  const [locData,setLocData] = useState(null) 
  const [data, setData] = useState(null);   
  const [hourlyWeather, setHourlyWeather] = useState([])
  const [error, setError] = useState(false)
  const list = useRef()

  function changeLocation(e){    
    if(e.target.value!==""){ 
      setLocation(e.target.value)          
    }
  }
  

  function changeWeatherLocation(){
    if(location!=="" && locData!=null && locData.features.length>0){          
      const selectedLocation = locData.features.filter(feature=>feature.properties.formatted === location)
      if(selectedLocation.length>=1){
        setError(false)
        setTitle(selectedLocation[0].properties.formatted)
        setLat(selectedLocation[0].properties.lat);
        setLon(selectedLocation[0].properties.lon);        
      }
      else{
        setError(true)
      }
      
    }
    else{
      setError(true)
    }   
  }

  useEffect(()=>{
      if(error===true){
        const timer = setTimeout(()=>{
          setError(false)
        },3000)
        return () => clearTimeout(timer);
      }    
      
  },[error]) 
  useEffect(()=>{
    if(location!==""){
      async function searchLocation(){
        const response = await map.get(`search?text=${location}&apiKey=8d23580e5aac475cba02eda7f58470cb`);
        setLocData(response.data)                          
      }
      searchLocation(); 
        
    }        
  },[location]) 

  useEffect(()=>{
    async function getData(lat,lon){
      const response = await axios.get(`/onecall?lat=${lat}&lon=${lon}&appid=${process.env.REACT_APP_WEATHER_API}&units=metric`);
      setData(response.data);  
      const lastTwelveHours = response.data.hourly.splice(0,12);
      setHourlyWeather(lastTwelveHours);       
    }
    getData( lat,lon );   
  },[lat,lon]) 

  function formatTime(unix){
    // multiplied by 1000 so that the argument is in milliseconds, not seconds.
    const date = new Date(unix * 1000);
    // Hours part from the timestamp
    const hours =  "0"+ date.getHours();
    // Minutes part from the timestamp
    const minutes = "0" + date.getMinutes();
    // Will display time in 10:30 format
    const formattedTime = hours.substr(-2) + ':' + minutes.substr(-2) 
    return formattedTime;    
  }

  function formatDay(unix){
    const dayname = new Date(unix * 1000).toLocaleDateString("en", {
      weekday: "long",
    });
    return dayname;
  }

  function capitalizeString(string){
    const stringArr = string.split(" ");
    let newString = '';
    let capitalizedWords = stringArr.map(word => {
      return word[0].toUpperCase()+ word.slice(1)
     
    });
    capitalizedWords.forEach(word=>{
      newString+=word;
      newString+=" ";
    });
    return newString;
  }

  return (
    <div >
      { error === true  ? <Alert severity="error" className={classes.alert}>Location cannot be found!</Alert>:'' }
      
      <Grid container spacing={1} alignItems="flex-end" justifyContent="center" style={{marginTop:"2em"}}>
        <Grid item >
          <LocationOnIcon style={{color:"#2196f3"}} />
        </Grid>
        <Grid item>   
          <input type="text" list="loc" placeholder="Search Location ( e.g. 'Oriental Mindoro, Philippines' )" onChange={(e)=>changeLocation(e)} className={classes.textbox}></input>    
          <datalist id="loc" ref={list}>
          {locData!==null?           
              locData.features.map(feature=>(<option data-id={feature.properties.place_id} className={classes.datalist} value={feature.properties.formatted}/>)) 
            :''      
          }
          </datalist>
             
        </Grid>
        <Grid item>
          <Button size="small" variant="contained" disableElevation onClick={()=>changeWeatherLocation()} className={classes.btn}>Update</Button>
        </Grid>
      </Grid>
      { data===null?(<Box textAlign="center" m={3} color="text.secondary">Fetching current weather...</Box>): 
      (
        <Box>     
            <Grid container justifyContent="center" alignItems="stretch" style={{marginBottom:"2rem", marginTop:"2rem"}}>
                <Grid item xs={10}>
                  <h2 className={classes.title}>{title}</h2>
                </Grid>
                <Grid  item xs={12} md={5}>
                    <Box textAlign="center" bgcolor="info.main" p={2}  height="100%" className={classes.currentWeatherLeft}>  
                        <h2>Current Weather</h2>
                        <img alt="Weather Icon" src={`http://openweathermap.org/img/wn/${data.current.weather[0].icon}@2x.png`}></img>                     
                        <p>{capitalizeString(data.current.weather[0].description)}</p>                          
                        <p>Timezone: {data.timezone}</p>
                        <p>Current Time: {formatTime(data.current.dt)}</p>
                        <p>Temperature: {data.current.temp} &deg;C</p>
                        <p>Feels Like: {data.current.feels_like} &deg;C</p>
                        <p>Sunrise: {formatTime(data.current.sunrise)}</p>
                        <p>Sunset: {formatTime(data.current.sunset)}</p>                   
                    </Box>
                </Grid>
                <Grid item xs={12} md={5} >
                    <Box bgcolor="error.main" textAlign="center"  p={2} height="100%" className={classes.currentWeatherRight}>
                        <h2>Detailed: </h2>
                        <p>Dew Point: {data.current.dew_point} &deg;C</p>
                        <p>Humidity: {data.current.humidity}%</p>
                        <p>Wind Speed: {data.current.wind_speed} m/s</p>
                        <p>Wind Gust: {data.current.wind_gust} m/s</p>
                        <p>Wind Direction: {data.current.wind_deg} &deg;</p>
                        <p>Pressure: {data.current.pressure} hPA</p>
                        <p>Cloudiness: {data.current.clouds}%</p>
                        <p>Visibility: {data.current.visibility} m</p> 
                        <p>UVI Index: {data.current.uvi}</p> 
                    </Box >      
                </Grid>    
                <Grid item xs={12} md={10} >
                <Tooltip title="Scrollable" placement="left">
                    <Box p={2}  textAlign="center" style={{background:"rgba(29,233,182,1)",color:"#ffebee", borderRadius:"1rem 1rem 0 0", paddingBottom:"23px"}}>
                        <h2>Daily Weather</h2>
                        <Grid container  spacing={1} wrap="nowrap" className={classes.customScrollbar}>                       
                        {   data.daily.map((daily,i) =>
                                {   
                                    if(i>0){
                                        return (
                                        <Grid item key={i}>
                                            <Box  p={2}  style={{ color:"#ffebee",width:"20rem", background:"rgba(0,191,165,1)"}}>
                                                <h2>{formatDay(daily.dt)}</h2>
                                                <img alt="Weather Icon" src={`http://openweathermap.org/img/wn/${daily.weather[0].icon}@2x.png`}></img>    
                                                <p>{capitalizeString(daily.weather[0].description)}</p>                          
                                                <p>Temperature: {daily.temp.day} &deg;C</p>
                                                <p>Feels Like: {daily.feels_like.day} &deg;C</p>
                                                <p>Humidity: {daily.humidity}%</p>
                                                <p>Wind Speed: {daily.wind_speed} m/s</p>
                                                <p>Wind Gust: {daily.wind_gust} m/s</p>
                                                <p>Wind Direction: {daily.wind_deg} &deg;</p>
                                                <p>Pressure: {daily.pressure} hPA</p>
                                                <p>Cloudiness: {daily.clouds}%</p>                                            
                                            </Box>
                                        </Grid>                      
                                        )    
                                    }                                                                  
                                })
                            }
                        </Grid>                                         
                    </Box>
                </Tooltip>
                </Grid> 
                <Grid item xs={12} md={10} >
                  <Tooltip title="Scrollable" placement="right">
                  <Box p={2}  textAlign="center" style={{background:"rgba(213,0,249,1)",color:"#ffebee", borderRadius:"1rem",marginTop:"-20px",paddingBottom:"0px"}}>
                      <h2>Hourly Weather</h2>
                      <Grid container spacing={1} wrap="nowrap" className={classes.customScrollbar}>                       
                        {   hourlyWeather.map( (hour,i) =>
                                {   
                                    return (
                                    <Grid item key={i}>
                                        <Box  p={2}  style={{ color:"#ffebee",width:"20rem", background:"rgba(171,71,188,1)"}}>
                                            <h2>{formatTime(hour.dt)}</h2>
                                            <img alt="Weather Icon"src={`http://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`}></img>    
                                            <p>{capitalizeString(hour.weather[0].description)}</p>                          
                                            <p>Temperature: {hour.temp} &deg;C</p>
                                            <p>Feels Like: {hour.feels_like} &deg;C</p>
                                            <p>Humidity: {hour.humidity}%</p>
                                            <p>Wind Speed: {hour.wind_speed} m/s</p>
                                            <p>Wind Gust: {hour.wind_gust} m/s</p>
                                            <p>Wind Direction: {hour.wind_deg} &deg;</p>
                                            <p>Pressure: {hour.pressure} hPA</p>
                                            <p>Cloudiness: {hour.clouds}%</p>
                                            <p>Visibility: {hour.visibility} m</p> 
                                        </Box>
                                    </Grid>                      
                                    )                                   
                                })
                            }
                        </Grid>                        
                    </Box>
                    </Tooltip>
                </Grid>  
            </Grid>  
        </Box>) }
    </div>
  );
}

export default CurrentWeather;
