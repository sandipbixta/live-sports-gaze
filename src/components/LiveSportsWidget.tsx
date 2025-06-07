
import React from 'react';

const LiveSportsWidget = () => {
  return (
    <div className="st_widget live_streams">
      <iframe 
        src="https://widget.streamthunder.org/?d=1&s=1&st=21&cs=6&fs=12px&tt=none&fc=333333&tc=333333&bc=FFFFFF&bhc=F3F3F3&thc=333333&pd=5px&brc=CCCCCC&brr=2px&mr=1px&tm=333333&tmb=FFFFFF&wb=EBEBEB&bcc=FFFFFF&bsh=0px&sm=1&rdb=EBEBEB&rdc=333333&lk=1" 
        width="100%" 
        height="800" 
        scrolling="auto" 
        align="top" 
        frameBorder="0"
        title="Live Sports Streams"
      >
        Your browser does not support frames, so you will not be able to view this page.
      </iframe>
      <br />
      <a 
        style={{ float: 'right', fontSize: '10px', color: '#6b6b6b' }} 
        href="https://streamthunder.org" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        Live Stream Sports
      </a>
    </div>
  );
};

export default LiveSportsWidget;
