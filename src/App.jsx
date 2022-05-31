import './App.css';
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import uniqid from 'uniqid';
import Nav from './components/Nav/Nav';
import StartScreen from './components/StartScreen/StartScreen';
import Welcome from './components/Welcome/Welcome';
import GameImage from './components/GameImage/GameImage';
import database from './components/Firebase/Firebase';
import Gameover from './components/Gameover/Gameover';

function App() {
  const [user, setUser] = useState({});
  const [gameOver, setGameOver] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [relativeCoordinates, setRelativeCoordinates] = useState({ x: 0, y: 0 });
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

  const gameOverCheck = () => targets.every((object) => object.found === true);

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
      relativeCoordinates.x >= targetX1 &&
      relativeCoordinates.x <= targetX2 &&
      relativeCoordinates.y >= targetY1 &&
      relativeCoordinates.y <= targetY2
    ) {
      console.log(`found ${target.name}`);
      markFound(target);
    } else {
      console.log('false');
    }
  };

  const initializeGame = () => {
    setUser({
      name: '',
      gameStart: Date.now(),
      gameFinish: '',
      time: { minutes: '', seconds: '' },
      id: uniqid()
    });
    setIsGameActive(true);
  };

  useEffect(() => {
    setGameOver(gameOverCheck());
  }, [targets]);

  useEffect(() => {
    setIsGameActive(false);
  }, [gameOver]);

  return (
    <div className="App">
      <Nav targets={targets} isGameActive={isGameActive} />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/startgame" element={<StartScreen initializeGame={initializeGame} />} />
        <Route
          path="/gameimage"
          element={
            !user.id ? (
              <Navigate replace to="/" />
            ) : (
              <GameImage
                targets={targets}
                setRelativeCoordinates={setRelativeCoordinates}
                checkTarget={checkTarget}
              />
            )
          }
        />

        {/*   <Route path="/something" element={<Something />} /> */}
      </Routes>
      {gameOver && <Gameover user={user} />}
    </div>
  );
}

export default App;
