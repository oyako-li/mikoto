import React ,{ useRef, useState, useEffect } from 'react';

export const Body: React.VFC = () => {
  const [itemList, setItemList] = useState(<li></li>);
  
  useEffect(()=>{
    let id=0;
    fetch('/list/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(res=>{console.log(res);return res.json()}).then(res=>{
      setItemList(res.files.map((path:string)=><li key={id++}><a href={'/log/'+path.replace('/',',')}>{path}</a></li>));
    }).catch((err)=>{
      console.log(err);
    });
  },[]);

  return (
    <>
      <img src="" alt="" className="camera"></img>
      <audio className="voice"></audio>
      <ul>{itemList}</ul>
   </>
 )
}

export default Body;