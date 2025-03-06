import Map_bg from '../assets/images/bgc5_1min7.webp';
// import IndexStation from "../assets/images/bgc2sta2.png";
// import { LazyLoadImage } from "react-lazy-load-image-component";
// import React, { useState, useRef, useEffect } from 'react'
import './css/map.css';

function MapAnimate() {

  return (
    <>
      <div id='map'>
        <img src={Map_bg} className="map-img" alt='map' loading="lazy"></img>
        {/* <LazyLoadImage src={IndexStation} className="map-img" alt='station'></LazyLoadImage> */}
      </div>
    </>
  )
}

export default MapAnimate;