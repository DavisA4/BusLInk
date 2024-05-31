import React, { useState, useEffect } from "react"; // Importējam nepieciešamās bibliotēkas un komponentes no React

const Clock = () => { // Definējam funkcijas komponenti Clock
  const [currentTime, setCurrentTime] = useState(new Date()); // Izveidojam stāvokli, kur saglabāsim pašreizējo laiku

  useEffect(() => { // Izmantojam useEffect, lai aktualizētu laiku katru sekundi
    const intervalId = setInterval(() => {
      setCurrentTime(new Date()); // Atjaunojam pašreizējo laiku
    }, 1000); // Uzstādam intervālu uz 1000 ms (1 sekunde)

    return () => clearInterval(intervalId); // Notīram intervalu, kad komponente tiek iznīcināta
  }, []); // Runājam šo efektu tikai reizi, kad komponente tiek ielādēta

  return (
    <div className="clock" style={{fontSize:'35px'}}> 
      {currentTime.toLocaleTimeString([], { // Formatējam laiku
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </div>
  );
};

export default Clock; // Eksportējam funkcijas komponenti
