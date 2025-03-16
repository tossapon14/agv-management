import BgMap from '../assets/images/bg_map.webp';
import Location from "../assets/images/location.png";
import Switch from './switch';
import { useState} from 'react'
import './css/map.css';

function MapAnimate() {
  const [stationshow, setStationshow] = useState(true)
  const [sw, setSwitch] = useState(true);
  const setSwitchShow = () => {
    setSwitch(!sw);
    setStationshow(!stationshow);
  }

  return (
    <div id="map">
        <img src={BgMap} className="map-img" alt='map' loading="lazy"></img>
        {stationshow && <img src={Location} className="map-img" alt='location' loading="lazy"></img>}
        <div className='switch-map-pick'>
          <h5>{sw ? "show" : "hide"}</h5>
          <Switch isOn={sw} handleToggle={setSwitchShow} />
        </div>
    </div>
  )
}

export default MapAnimate;