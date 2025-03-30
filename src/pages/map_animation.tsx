import BgMap from '../assets/images/bg_map.png';
import AGV1 from '../assets/images/carmodel_blue.png';
import AGV2 from '../assets/images/carmodel.webp';
import AGV3 from '../assets/images/carmodel_green.png';
import AGV4 from '../assets/images/carmodel_yellow.png';

import Location from "../assets/images/location.png";
import Switch from './switch';
import { useState} from 'react'
import './css/map.css';

interface MapAnimateProps {
  data:{agv:string,position:string[]}[] // Optional prop to toggle station visibility initially
}
const AGV:{[key:string]:string} = {AGV1:AGV1, AGV2:AGV2,AGV3:AGV3, AGV4:AGV4}
function MapAnimate({data}: MapAnimateProps) {
  const [stationshow, setStationshow] = useState(true);
  const [sw, setSwitch] = useState(true);
  const setSwitchShow = () => {
    setSwitch(!sw);
    setStationshow(!stationshow);
  };

  return (
    <div id="map">
      <img src={BgMap} className="map-img" alt="map" loading="lazy" />
      {stationshow && <img src={Location} className="map-img" alt="location" loading="lazy" />}
      {data.map(agv=><img key={agv.agv} src={AGV[agv.agv]} className='carmodel-position' style={{left:`${agv.position[0]}`, bottom:`${agv.position[1]}`,transform: `rotate(${agv.position[2]}deg)`}}  alt={`${agv.agv}`}></img>)}
      <div className="switch-map-pick">
        <h5>{sw ? "show" : "hide"}</h5>
        <Switch isOn={sw} handleToggle={setSwitchShow} />
      </div>
    </div>
  );
}

export default MapAnimate;