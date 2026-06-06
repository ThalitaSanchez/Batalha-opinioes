import React, { useState, useEffect } from "react";
import { auth, provider, db } from "./firebase";
import {
  signInWithPopup,
  signInAnonymously,
  onAuthStateChanged
} from "firebase/auth";

import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot
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

  useEffect(() => {
    onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    const q = query(collection(db, "ranking"), orderBy("vitorias", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const dados = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setRanking(dados);
    });

    return () => unsub();
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

  const julgar = async () => {
    const score1 = argumento1.length + Math.random() * 20;
    const score2 = argumento2.length + Math.random() * 20;

    const vencedor =
      score1 > score2 ? jogador1 : jogador2;

    const perdedor =
      score1 > score2 ? jogador2 : jogador1;

    setResultado({
      vencedor,
      perdedor,
      score1: Math.floor(score1),
      score2: Math.floor(score2)
    });

    await addDoc(collection(db, "ranking"), {
      nome: vencedor,
      vitorias: 1
    });
  };

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

  return (
    <div style={{ padding: 20 }}>
      <h1>Batalha de Opiniões</h1>

      <button onClick={gerarTema}>
        Tema Aleatório
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
        JULGAR BATALHA
      </button>

      {resultado && (
        <div>
          <h2>🏆 Vencedor: {resultado.vencedor}</h2>

          <p>
            {resultado.score1} x {resultado.score2}
          </p>

          <p>
            {resultado.perdedor} foi completamente destruído no debate 😂
          </p>
        </div>
      )}

      <hr />

      <h2>🏅 Ranking Público</h2>

      {ranking.map((r) => (
        <div key={r.id}>
          {r.nome} - {r.vitorias} vitória(s)
        </div>
      ))}
    </div>
  );
}