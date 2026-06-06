import React, { useState, useEffect } from "react";
import { auth, provider, db } from "./firebase";
import {
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged
} from "firebase/auth";

import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment
} from "firebase/firestore";

export default function App() {
  const [user, setUser] = useState(null);

  const [tema, setTema] = useState("");
  const [jogador1, setJogador1] = useState("");
  const [jogador2, setJogador2] = useState("");

  const [argumento1, setArgumento1] = useState("");
  const [argumento2, setArgumento2] = useState("");

  const [resultado, setResultado] = useState(null);

  const [ranking, setRanking] = useState([]);

  const temas = [
    "Pizza com ketchup?",
    "Café ou energético?",
    "Android ou iPhone?",
    "Praia ou montanha?",
    "Filme ou série?"
  ];

  // AUTH + RANKING
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    const q = query(collection(db, "users"), orderBy("points", "desc"));

    const unsubRanking = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setRanking(dados);
    });

    return () => {
      unsubAuth();
      unsubRanking();
    };
  }, []);

  const loginGoogle = async () => {
    await signInWithPopup(auth, provider);
  };

  const loginAnonimo = async () => {
    await signInAnonymously(auth);
  };

  const gerarTema = () => {
    const aleatorio = temas[Math.floor(Math.random() * temas.length)];
    setTema(aleatorio);
  };

  // 🎯 SISTEMA DE COMPETIÇÃO (CORRIGIDO)
  const julgar = async () => {
    if (!jogador1 || !jogador2) return;

    const score1 = argumento1.length + Math.random() * 20;
    const score2 = argumento2.length + Math.random() * 20;

    const vencedor = score1 > score2 ? jogador1 : jogador2;
    const perdedor = score1 > score2 ? jogador2 : jogador1;

    setResultado({
      vencedor,
      perdedor,
      score1: Math.floor(score1),
      score2: Math.floor(score2)
    });

    const winnerRef = doc(db, "users", vencedor);
    const loserRef = doc(db, "users", perdedor);

    const winnerSnap = await getDoc(winnerRef);
    const loserSnap = await getDoc(loserRef);

    // VENCEDOR
    if (winnerSnap.exists()) {
      await updateDoc(winnerRef, {
        points: increment(10),
        wins: increment(1)
      });
    } else {
      await setDoc(winnerRef, {
        name: vencedor,
        points: 10,
        wins: 1,
        losses: 0
      });
    }

    // PERDEDOR
    if (loserSnap.exists()) {
      await updateDoc(loserRef, {
        points: increment(-5),
        losses: increment(1)
      });
    } else {
      await setDoc(loserRef, {
        name: perdedor,
        points: 0,
        wins: 0,
        losses: 1
      });
    }
  };

  // LOGIN SCREEN
  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h1>Batalha de Opiniões</h1>

        <button onClick={loginGoogle}>
          Entrar com Google
        </button>

        <br /><br />

        <button onClick={loginAnonimo}>
          Entrar Anônimo
        </button>
      </div>
    );
  }

  // APP PRINCIPAL
  return (
    <div style={{ padding: 20 }}>
      <h1>⚔️ Batalha de Opiniões</h1>

      <button onClick={gerarTema}>
        🎲 Tema Aleatório
      </button>

      <h2>{tema}</h2>

      <input
        placeholder="Jogador 1"
        value={jogador1}
        onChange={(e) => setJogador1(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Argumento jogador 1"
        value={argumento1}
        onChange={(e) => setArgumento1(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Jogador 2"
        value={jogador2}
        onChange={(e) => setJogador2(e.target.value)}
      />

      <br /><br />

      <textarea
        placeholder="Argumento jogador 2"
        value={argumento2}
        onChange={(e) => setArgumento2(e.target.value)}
      />

      <br /><br />

      <button onClick={julgar}>
        ⚔️ JULGAR BATALHA
      </button>

      {resultado && (
        <div style={{ marginTop: 20 }}>
          <h2>🏆 Vencedor: {resultado.vencedor}</h2>
          <p>
            {resultado.score1} x {resultado.score2}
          </p>
          <p>
            {resultado.perdedor} perdeu feio 😭
          </p>
        </div>
      )}

      <hr />

      <h2>🏅 Ranking Global</h2>

      {ranking.length === 0 && <p>Carregando ranking...</p>}

      {ranking.map((r, index) => (
        <div key={r.id} style={{ marginBottom: 5 }}>
          #{index + 1} {r.name} — {r.points} pts 🏆 ({r.wins || 0}W / {r.losses || 0}L)
        </div>
      ))}
    </div>
  );
}