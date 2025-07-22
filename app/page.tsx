"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface PlayerData {
  socketId: string;
  clicks: number;
}

let socket: Socket;

export default function Home() {

  const [socketId, setSocketId] = useState<string>("");
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<PlayerData | null>(null);

  useEffect(() => {
    if (!socket) {
      socket = io("http://localhost:4000");

      socket.on("connect", () => {
        setSocketId(socket.id || "");
        socket.emit("join-game");
      });

      socket.on("players-update", (updatedPlayers: PlayerData[]) => {
        setPlayers(updatedPlayers);
      });

      socket.on("score-update", (updatedPlayers: PlayerData[]) => {
        setPlayers(updatedPlayers);
      });

      socket.on("game-start", () => {
        setWinner(null);
        setGameStarted(true);
      });

      socket.on("game-over", (winnerData: PlayerData) => {
        setGameStarted(false);
        setWinner(winnerData);
      });
    }

    return () => {
      socket.off("connect");
      socket.off("players-update");
      socket.off("score-update");
      socket.off("game-start");
      socket.off("game-over");
    };
  }, []);

  const handleClick = () => {
    if (gameStarted) {
      socket.emit("button-pressed");
    }
  };

  const startGame = () => {
    socket.emit("start-game");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 p-4">
      <h1 className="text-3xl font-bold">Button Racing Game</h1>

      <button
        onClick={handleClick}
        disabled={!gameStarted}
        className="px-8 py-4 bg-blue-600 text-white rounded-lg text-xl disabled:opacity-50 cursor-pointer"
      >
        Click Me!
      </button>

      <button
        onClick={startGame}
        disabled={gameStarted}
        className="px-6 py-2 bg-green-600 text-white rounded-md cursor-pointer"
      >
        Start Game
      </button>

      <div className="mt-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Players</h2>
        <ul>
          {players.map((player) => (
            <li
              key={player.socketId}
              className={`py-1 ${
                player.socketId === socketId ? "font-bold text-blue-700" : ""
              }`}
            >
              {player.socketId === socketId ? "(You) " : ""}
              {player.socketId.slice(0, 5)}: {player.clicks} clicks
            </li>
          ))}
        </ul>
      </div>

      {winner && (
        <div className="mt-6 text-2xl font-bold text-green-700">
           Winner: {winner.socketId.slice(0, 5)} with {winner.clicks} clicks!
        </div>
      )}
    </main>
  );
}
