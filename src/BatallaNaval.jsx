import React, { useState, useEffect } from 'react';
import './App.css';

const numFilas = 10;
const numColumnas = 10;

const filas = Array.from({ length: numFilas }, (_, i) => String.fromCharCode('A'.charCodeAt(0) + i));
const columnas = Array.from({ length: numColumnas }, (_, i) => i + 1);

const tamanoBarco = 4; 
const barcosTotales = 5; 

const Alerta = ({ mensaje, onClose }) => (
  <div className="alerta">
    <p>
      <strong>{mensaje}</strong>
    </p>
    <button className="close-button" onClick={onClose}>
      Cerrar
    </button>
  </div>
);

const BatallaNaval = () => {
  //Funcion que devuelve un tablero vacio 
  const generarTableroVacio = () => Array.from({ length: numFilas }, () => Array(numColumnas).fill(null));
 
  //Genera un nuevo tablero con posiciones aleatorias de barcos ocultos.
  //Utiliza funciones auxiliares para verificar la colocación y superposición de los barcos.
  const generarTableroOculto = () => {
    const nuevoTableroOculto = generarTableroVacio();

    for (let numeroBarco = 1; numeroBarco <= barcosTotales; numeroBarco++) {
      let colocado = false;

      while (!colocado) {
        const filaAleatoria = Math.floor(Math.random() * numFilas);
        const columnaAleatoria = Math.floor(Math.random() * numColumnas);
        const esHorizontal = Math.random() < 0.5;

        if (
          verificarColocacion(nuevoTableroOculto, filaAleatoria, columnaAleatoria, tamanoBarco, esHorizontal) &&
          !verificarSuperposicion(nuevoTableroOculto, filaAleatoria, columnaAleatoria, tamanoBarco, esHorizontal)
        ) {
          colocarBarco(nuevoTableroOculto, filaAleatoria, columnaAleatoria, tamanoBarco, esHorizontal);
          colocado = true;
        }
      }
    }

    return nuevoTableroOculto;
  };

  //Verifica si es posible colocar un barco en una posición específica (fila, columna)
  // de manera horizontal o vertical.
  const verificarColocacion = (tablero, fila, columna, tamano, esHorizontal) => {
    if (esHorizontal) {
      for (let i = 0; i < tamano; i++) {
        if (columna + i >= numColumnas || tablero[fila][columna + i] !== null) {
          return false;
        }
      }
    } else {
      for (let i = 0; i < tamano; i++) {
        if (fila + i >= numFilas || tablero[fila + i][columna] !== null) {
          return false;
        }
      }
    }

    return true;
  };

  //Verifica si hay superposición de barcos en una posición específica (fila, columna) 
  //para evitar que se solapen.
  const verificarSuperposicion = (tablero, fila, columna, tamano, esHorizontal) => {
    if (esHorizontal) {
      for (let i = 0; i < tamano; i++) {
        if (columna + i >= numColumnas || tablero[fila][columna + i] === 'S') {
          return true;
        }
      }
    } else {
      for (let i = 0; i < tamano; i++) {
        if (fila + i >= numFilas || tablero[fila + i][columna] === 'S') {
          return true;
        }
      }
    }

    return false;
  };

  //Coloca un barco en el tablero en una posición específica (fila, columna) de
  // manera horizontal o vertical.
  const colocarBarco = (tablero, fila, columna, tamano, esHorizontal) => {
    if (esHorizontal) {
      for (let i = 0; i < tamano; i++) {
        tablero[fila][columna + i] = 'S'; // 'S' representa una parte del barco
      }
    } else {
      for (let i = 0; i < tamano; i++) {
        tablero[fila + i][columna] = 'S';
      }
    }
  };

  //Valida el comando de ataque, realiza el ataque y actualiza el tablero
  // y mensajes según el resultado del ataque.
  const manejarAtaque = () => {
    // Verificar si el comando de ataque es válido
    const regex = /^[A-Ja-j]([1-9]|10)$/;
    if (!regex.test(comandoAtaque)) {
      setMensaje('Comando de ataque no válido. Utilice un formato como A1, B2, C3.');
      return;
    }

    // Convierte el comando a coordenadas de matriz
    const columna = parseInt(comandoAtaque.slice(1)) - 1;
    const fila = comandoAtaque.charCodeAt(0) - 'A'.charCodeAt(0);

    // Realiza el ataque
    if (tableroOculto[fila][columna] === 'S') {
      setMensaje('¡Ataque exitoso! Barco alcanzado.');

      setTablero((tableroPrevio) => {
        const tableroActualizado = tableroPrevio.map((filaArray, indiceFila) =>
          filaArray.map((celda, indiceColumna) => {
            if (indiceFila === fila && indiceColumna === columna) {
              // Verifica si hay 4 "O" consecutivas horizontalmente
              let consecutivoHorizontal = true;
              for (let i = 0; i < tamanoBarco; i++) {
                if (tableroPrevio[fila][indiceColumna + i] !== 'O') {
                  consecutivoHorizontal = false;
                  break;
                }
              }

              // Verifica si hay 4 "O" consecutivas verticalmente
              let consecutivoVertical = true;
              for (let i = 0; i < tamanoBarco; i++) {
                if (tableroPrevio[indiceFila + i][columna] !== 'O') {
                  consecutivoVertical = false;
                  break;
                }
              }

              if (consecutivoHorizontal || consecutivoVertical) {
                setBarcosDestruidos((contadorPrevio) => Math.floor(contadorPrevio + 0.25));
              }

              return 'O';
            } else {
              return celda;
            }
          })
        );

        // Verifica si hay barcos destruidos después de cada tiro acertado
        const contadorDestruidos = tableroActualizado.flat().filter((celda) => celda === 'O').length / tamanoBarco;
        setBarcosDestruidos(Math.floor(contadorDestruidos));

        return tableroActualizado;
      });
    } else {
      setMensaje('Ataque fallido. No hay barco en esta posición.');
      setTablero((tableroPrevio) => {
        const tableroActualizado = [...tableroPrevio];
        // Solo actualiza con 'X' si la celda no ha sido atacada previamente (no es 'O')
        if (tableroPrevio[fila][columna] !== 'O') {
          tableroActualizado[fila] = [...tableroPrevio[fila]];
          tableroActualizado[fila][columna] = 'X'; // se marca una 'X' para un ataque fallido
        }
        return tableroActualizado;
      });
    }

    setComandoAtaque('');
  };

  // Reinicia el juego generando un nuevo tablero y posiciones ocultas de los barcos
  const reiniciarJuego = () => {
    const nuevoTablero = generarTableroVacio();
    const nuevoTableroOculto = generarTableroOculto();
    setTablero(nuevoTablero);
    setTableroOculto(nuevoTableroOculto);
    setComandoAtaque('');
    setBarcosDestruidos(0);
    setMensaje('');
    setMostrarAlerta(false);
  };

  const [tablero, setTablero] = useState(generarTableroVacio());
  const [tableroOculto, setTableroOculto] = useState(generarTableroOculto());
  const [comandoAtaque, setComandoAtaque] = useState('');
  const [barcosDestruidos, setBarcosDestruidos] = useState(0);
  const [mensaje, setMensaje] = useState('');
  const [ganador, setGanador] = useState(false);

  useEffect(() => {
    // se  genera las  posiciones ocultas de los barcos al ingresar a la vista
    const nuevoTableroOculto = generarTableroOculto();
    setTableroOculto(nuevoTableroOculto);
  }, []);

  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const cerrarAlerta = () => {
    // Restablece el juego a su estado inicial
    const nuevoTablero = generarTableroVacio();
    const nuevoTableroOculto = generarTableroOculto();

    setTablero(nuevoTablero);
    setTableroOculto(nuevoTableroOculto);
    setComandoAtaque('');
    setBarcosDestruidos(0);
    setMensaje('');

    setMostrarAlerta(false);
  };

  useEffect(() => {
    // Verifica si se alcanzó el límite de 5 barcos destruidos
    if (barcosDestruidos === 5) {
      setMensaje('¡Felicidades! Has destruido 5 barcos. Juego terminado.');
      setGanador(true);
      setMostrarAlerta(true);
    }
  }, [barcosDestruidos]);

  return (
    <div className="App">
      <h2>Batalla Naval</h2>

      {barcosDestruidos < 5 ? (
        <div className="input-container">
          <div className="input-label">
            <label>
              Ingrese el comando de ataque
            </label>
          </div>
          <input
            type="text"
            value={comandoAtaque}
            onChange={(e) => setComandoAtaque(e.target.value.toUpperCase())}
          />
          <button onClick={manejarAtaque}>Atacar</button>
          <button className="restart-button" onClick={reiniciarJuego}>Reiniciar</button>
        </div>
      ) : (
        <div>
          {mostrarAlerta && <Alerta mensaje="¡Felicidades! Eres el ganador." onClose={cerrarAlerta} />}
        </div>
      )}

      <div className="destroyed-ships-container">
        <p>Barcos destruidos: {barcosDestruidos}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th></th>
            {columnas.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((fila, indiceFila) => (
            <tr key={fila}>
              <th>{fila}</th>
              {columnas.map((col, indiceColumna) => (
                <td key={`${fila}${col}`} className={tablero[indiceFila][indiceColumna] === 'O' ? 'O' : tablero[indiceFila][indiceColumna] === 'X' ? 'X' : ''}>
                  {/* Muestra los barcos ocultos solo para propósitos de desarrollo */}
                  {/*tableroOculto[indiceFila][indiceColumna] === 'S' && tablero[indiceFila][indiceColumna] !== 'O' ? 'S' : ''*/}
                  {/* Muestra los ataques en el tablero */}
                  {tablero[indiceFila][indiceColumna] === 'O' ? 'O' : tablero[indiceFila][indiceColumna] === 'X' ? 'X' : ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default BatallaNaval;
