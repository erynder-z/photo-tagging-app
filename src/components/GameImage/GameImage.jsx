/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import './GameImage.css';
import React, { useEffect, useState, useRef } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import PropTypes from 'prop-types';
import image from '../../assets/wimmelbild.jpg';
import Popupmenu from '../Popupmenu/Popupmenu';

function GameImage({ database }) {
  const highlighter = useRef();
  const [targets, setTargets] = useState([
    {
      name: 'target1',
      found: false
    },
    {
      name: 'target2',
      found: false
    },
    {
      name: 'target3',
      found: false
    }
  ]);
  const [clickX, setClickX] = useState();
  const [clickY, setClickY] = useState();
  const [relativeX, setRelativeX] = useState();
  const [relativeY, setRelativeY] = useState();
  const [showPopup, setShowPopup] = useState(false);

  const getClickCoordinates = (e) => {
    setClickX(e.nativeEvent.offsetX);
    setClickY(e.nativeEvent.offsetY);
    setRelativeX(Math.round((e.nativeEvent.offsetX / e.nativeEvent.target.offsetWidth) * 100));
    setRelativeY(Math.round((e.nativeEvent.offsetY / e.nativeEvent.target.offsetHeight) * 100));
  };

  const handleClick = () => {
    setShowPopup(!showPopup);
  };

  const markFound = (target) => {
    setTargets(
      [...targets].map((object) => {
        if (object.name === target.name) {
          return {
            ...object,
            found: true
          };
        }
        return object;
      })
    );
  };

  const checkTarget = async (proposedTarget) => {
    const getData = async () => {
      const docRef = doc(database, 'targets', proposedTarget);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data().coords;
      }
      console.log('No such document!');
      return null;
    };

    const target = targets.find((item) => item.name === proposedTarget);
    const targetCoords = await getData();

    const targetX1 = targetCoords[0];
    const targetY1 = targetCoords[1];
    const targetX2 = targetCoords[2];
    const targetY2 = targetCoords[3];

    if (
      relativeX >= targetX1 &&
      relativeX <= targetX2 &&
      relativeY >= targetY1 &&
      relativeY <= targetY2
    ) {
      console.log(`found ${target.name}`);
      markFound(target);
    } else {
      console.log('false');
    }
  };

  useEffect(() => {
    if (clickX && clickY) {
      highlighter.current.style.display = 'block';
    }
  }, [clickX]);

  return (
    <div className="game">
      <div
        className="image-container"
        onClick={(e) => {
          getClickCoordinates(e);
          handleClick();
        }}
        role="grid"
        tabIndex={0}>
        <img src={image} alt="a wimmelbild" />
        <div
          className="highlighter"
          ref={highlighter}
          style={{
            top: `calc(${clickY}px + 10vh - 20px)`,
            left: `${clickX - 20}px`
          }}
        />
      </div>
      {showPopup && <Popupmenu position={[clickX, clickY]} checkTarget={checkTarget} />}
    </div>
  );
}

export default GameImage;

GameImage.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  database: PropTypes.object.isRequired
};
