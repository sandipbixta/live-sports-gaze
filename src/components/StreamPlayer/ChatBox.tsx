import React, { useEffect } from 'react';

const ChatBox: React.FC = () => {
  useEffect(() => {
    // Create and append the Chatango script
    const script = document.createElement('script');
    script.id = 'cid0020000418580169573';
    script.setAttribute('data-cfasync', 'false');
    script.async = true;
    script.src = '//st.chatango.com/js/gz/emb.js';
    script.style.width = '200px';
    script.style.height = '300px';
    script.innerHTML = JSON.stringify({
      handle: "damitvprogroupchat",
      arch: "js",
      styles: {
        a: "ff6600",
        b: 100,
        c: "000000",
        d: "000000",
        k: "ff6600",
        l: "ff6600",
        m: "ff6600",
        p: "10",
        q: "ff6600",
        r: 100,
        cv: 1,
        cvbg: "ff6600",
        cvw: 75,
        cvh: 30
      }
    });

    // Find the chatbox container and append
    const chatContainer = document.getElementById('chatbox-container');
    if (chatContainer) {
      chatContainer.appendChild(script);
    }

    return () => {
      // Cleanup script on unmount
      const existingScript = document.getElementById('cid0020000418580169573');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <div 
      id="chatbox-container" 
      className="w-[200px] h-[300px] bg-background border border-border rounded-lg overflow-hidden shadow-lg"
    />
  );
};

export default ChatBox;