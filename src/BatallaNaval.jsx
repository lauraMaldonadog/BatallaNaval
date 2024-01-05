import React, { useState, useEffect } from 'react';
import './App.css';

const numRows = 10;
const numCols = 10;

const rows = Array.from({ length: numRows }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i));
const columns = Array.from({ length: numCols }, (_, i) => i + 1);

const shipSize = 4; // Tamaño fijo de los barcos
const totalShips = 5; // Número total de barcos

function App() {
  const [board, setBoard] = useState(generateEmptyBoard());
  const [hiddenBoard, setHiddenBoard] = useState(generateHiddenBoard());
  const [attackCommand, setAttackCommand] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Al entrar en la vista, generamos posiciones ocultas de los barcos
    const newHiddenBoard = generateHiddenBoard();
    setHiddenBoard(newHiddenBoard);
  }, []);

  useEffect(() => {
    // Cada vez que cambia el comando de ataque, intentamos realizar el ataque
    if (attackCommand) {
      handleAttack();
    }
  }, [attackCommand]);

  function generateEmptyBoard() {
    return Array.from({ length: numRows }, () => Array(numCols).fill(null));
  }

  function generateHiddenBoard() {
    const newHiddenBoard = generateEmptyBoard();

    for (let shipNumber = 1; shipNumber <= totalShips; shipNumber++) {
      let placed = false;

      while (!placed) {
        const randomRow = Math.floor(Math.random() * numRows);
        const randomCol = Math.floor(Math.random() * numCols);
        const isHorizontal = Math.random() < 0.5;

        if (
          checkPlacement(newHiddenBoard, randomRow, randomCol, shipSize, isHorizontal) &&
          !checkOverlap(newHiddenBoard, randomRow, randomCol, shipSize, isHorizontal)
        ) {
          placeShip(newHiddenBoard, randomRow, randomCol, shipSize, isHorizontal);
          placed = true;
        }
      }
    }

    return newHiddenBoard;
  }

  function checkPlacement(board, row, col, size, isHorizontal) {
    if (isHorizontal) {
      for (let i = 0; i < size; i++) {
        if (col + i >= numCols || board[row][col + i] !== null) {
          return false;
        }
      }
    } else {
      for (let i = 0; i < size; i++) {
        if (row + i >= numRows || board[row + i][col] !== null) {
          return false;
        }
      }
    }

    return true;
  }

  function checkOverlap(board, row, col, size, isHorizontal) {
    if (isHorizontal) {
      for (let i = 0; i < size; i++) {
        if (col + i >= numCols || board[row][col + i] === 'S') {
          return true;
        }
      }
    } else {
      for (let i = 0; i < size; i++) {
        if (row + i >= numRows || board[row + i][col] === 'S') {
          return true;
        }
      }
    }

    return false;
  }

  function placeShip(board, row, col, size, isHorizontal) {
    if (isHorizontal) {
      for (let i = 0; i < size; i++) {
        board[row][col + i] = 'S'; // 'S' representa una parte del barco
      }
    } else {
      for (let i = 0; i < size; i++) {
        board[row + i][col] = 'S';
      }
    }
  }

  function handleAttack() {
    // Verificar si el comando de ataque es válido
    const regex = /^[A-Ja-j]([1-9]|10)$/;
    if (!regex.test(attackCommand)) {
      setMessage('Comando de ataque no válido. Utilice un formato como A1, B2, C3.');
      return;
    }

    // Convertir el comando a coordenadas de matriz
    const col = parseInt(attackCommand.slice(1)) - 1;
    const row = attackCommand.charCodeAt(0) - 'A'.charCodeAt(0);

    // Realizar el ataque
    // Realizar el ataque
    if (hiddenBoard[row][col] === 'S') {
      setMessage('¡Ataque exitoso! Barco alcanzado.');
      setBoard(prevBoard => {
        const updatedBoard = prevBoard.map((rowArray, rowIndex) =>
          rowArray.map((cell, colIndex) =>
            rowIndex === row && colIndex === col ? 'O' : cell
          )
        );
        return updatedBoard;
      });
    } else {
      setMessage('Ataque fallido. No hay barco en esta posición.');
      setBoard(prevBoard => {
        const updatedBoard = [...prevBoard];
        // Solo actualizar con 'X' si la celda no ha sido atacada previamente (no es 'O')
        if (prevBoard[row][col] !== 'O') {
          updatedBoard[row] = [...prevBoard[row]];
          updatedBoard[row][col] = 'X'; // Marcar con 'X' para un ataque fallido
        }
        return updatedBoard;
      });
    }
    setAttackCommand('');
  }
  return (
    <div className="App">
      <h2>Batalla Naval</h2>

      <div className="input-container">
        <label>
          Ingrese el comando de ataque (Ejemplo: A1, B2, C3):
          <input type="text" value={attackCommand} onChange={(e) => setAttackCommand(e.target.value.toUpperCase())} />
        </label>
        <button onClick={handleAttack}>Atacar</button>
      </div>

      <table>
        <thead>
          <tr>
            <th></th>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row}>
              <th>{row}</th>
              {columns.map((col, colIndex) => (
                <td key={`${row}${col}`}>
                  {/* Mostrar barcos ocultos solo para propósitos de desarrollo */}
                  {hiddenBoard[rowIndex][colIndex] === 'S' ? 'S' : ''}
                  {/* Mostrar ataques en el tablero */}
                  {board[rowIndex][colIndex] === 'O' ? 'O' : board[rowIndex][colIndex] === 'X' ? 'X' : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
