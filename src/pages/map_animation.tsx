import BgMap from '../assets/images/bg_map.png';
import AGV1 from '../assets/images/carmodel_blue.png';
import AGV2 from '../assets/images/carmodel.webp';
import AGV3 from '../assets/images/carmodel_green.png';
import AGV4 from '../assets/images/carmodel_yellow.png';
import Pin from '../assets/images/pin.png';

import Location from "../assets/images/location.png";
import Switch from './switch';
import { useState, useEffect, useRef } from 'react'
import './css/map.css';

interface MapAnimateProps {
  data: { agv: string, online: boolean, position: string[] }[] // Optional prop to toggle station visibility initially
  paths: number[][][]
  positionDrop:{x:string,y:string}[]
}
const AGV: { [key: string]: string } = { AGV1: AGV1, AGV2: AGV2, AGV3: AGV3, AGV4: AGV4 }
function MapAnimate({ data, paths,positionDrop }: MapAnimateProps) {
  const [stationshow, setStationshow] = useState(true);
  const [sw, setSwitch] = useState(true);
  const [agvPath, setAgvPath] = useState<string[]>([])
  const [pathColors, setPathColors] = useState<string[]>([]);
  const mapID = useRef<HTMLDivElement>(null);
  const setSwitchShow = () => {
    setSwitch(!sw);
    setStationshow(!stationshow);
  };
  
  // console.log(paths)
  useEffect(() => {
    const randomRgbColor = () => {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      return `rgba(${r}, ${g}, ${b} , 0.9)`;
    };
    const calPath = (arragv: number[][][]) => {
      const _agvPath: string[] = [];
      const _colors: string[] = [];
      arragv.forEach(agv => {
        let d = "M";
        agv.forEach(path => {
          const x = path[0] * -0.9966398834184859 - path[1] * 0.08190813622337459;
          const y = path[0] * 0.08190813622337459 + path[1] * -0.9966398834184859;
          const positionX = (((x + 54) / 996.782) * mapID.current!.clientWidth).toFixed(2);
          const positionY = ((1 - ((y + 280) / 586.10)) * mapID.current!.clientHeight).toFixed(2);
          d = d + ' ' + positionX + ' ' + positionY;
        });
        _agvPath.push(d);
        if(pathColors.length===0){
        _colors.push(randomRgbColor()); // Store random color once per path
        }
      });
      setAgvPath(_agvPath);
      if(pathColors.length===0){
         setPathColors(_colors); // Set colors once
      }
     
    };
  
    function handleResize() {
      calPath(paths);
    }
  
    handleResize();
    mapID.current?.addEventListener("resize", handleResize);
    return () => {
      mapID.current?.removeEventListener("resize", handleResize);
    };
  }, [paths]);

  return (
    <div id="map" ref={mapID}>
      <img src={BgMap} className="map-img" alt="map" loading="lazy" />
      {stationshow && <img src={Location} className="map-img" alt="location" loading="lazy" />}
      
      <svg  className='svg'  >
      {agvPath.map((d,index) => 
        <path
         key={index}
          d={d}
          fill="none"
          stroke={pathColors[index] || '#000'}  // Line color
          strokeWidth={8} // Line thickness
          strokeLinejoin="round"
          strokeLinecap="round" // Makes the line edges rounded
        />
      )}</svg>
      {positionDrop.map((drop,index)=><img key={index} src={Pin} width={48} height={48} className='pin-animate' alt='pin' style={{position:'absolute',left:drop.x,bottom:drop.y}} />)}
      {data.map(agv => agv.online && <img key={agv.agv} src={AGV[agv.agv]} className='carmodel-position' style={{ left: `${agv.position[0]}`, bottom: `${agv.position[1]}`, transform: `rotate(${agv.position[2]}deg)` }} alt={`${agv.agv}`}></img>)}
      <div className="switch-map-pick">
        <h5>{sw ? "show" : "hide"}</h5>
        <Switch isOn={sw} handleToggle={setSwitchShow} />
      </div>
    </div>
  );
}

export default MapAnimate;