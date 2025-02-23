import React, { useState } from "react";
import logo from './v.png'; // Logo image
import speakerOn from './speaker-on.png'; // Add your speaker on image
import speakerOff from './speaker-off.png'; // Add your speaker off image
import './App.css'; // Import CSS for animations
import videoSrc from './robo.mp4'; // Import the video

function App() {
  const [accountNumber, setAccountNumber] = useState("");
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [verifiedUser  , setVerifiedUser  ] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true); // Enable voice by default
  const [videoEnded, setVideoEnded] = useState(false); // State to track video end

  const API_BASE_URL = "https://f371-34-16-131-18.ngrok-free.app";

  const speakText = (text) => {
    if (ttsEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    }
  };

  const verifyAccount = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/verify-account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_number: accountNumber }),
      });

      if (!response.ok) {
        throw new Error("Account verification failed.");
      }

      const data = await response.json();
      setVerifiedUser  (data.user);
      const welcomeMessage = `Welcome ${data.user.name}! How can I help you today?`;
      setChatHistory([{ sender: "bot", text: welcomeMessage }]);
      speakText(welcomeMessage);
    } catch (error) {
      alert("Invalid account number. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!verifiedUser  ) {
      alert("Please verify your account first.");
      return;
    }

    if (!message.trim()) {
      alert("Message cannot be empty.");
      return;
    }

    const newMessage = { sender: "user", text: message };
    setMessage("");
    setChatHistory((prevChat) => [...prevChat, newMessage]);

    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_number: accountNumber, message }),
      });

      if (!response.ok) {
        throw new Error("Error sending message.");
      }

      const data = await response.json();
      setChatHistory((prevChat) => [...prevChat, { sender: "bot", text: data.response }]);
      speakText(data.response);
    } catch (error) {
      alert("Error sending message.");
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  const handleVideoEnd = () => {
    setVideoEnded(true); // Set video ended state to true
  };

  return (
    <div style={styles.container}>
      {!videoEnded ? ( // Show video if it hasn't ended
        <div style={styles.videoContainer}>
          <video
            src={videoSrc}
            autoPlay
            onEnded={handleVideoEnd} // Handle video end event
            style={styles.video}
            muted
            playbackRate={1.75} // Set video playback speed to 1.75x
          />
        </div>
      ) : (
        <div style={styles.verificationContainer}>
          <h2 style={styles.heading}>Verizon Bot</h2>

          {!verifiedUser  ? (
            <div style={styles.loginContainer}>
              <input
                type="text"
                placeholder="Enter Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                style={styles.input}
              />
              <button onClick={verifyAccount} style={styles.button} disabled={loading}>
                {loading ? "Verifying..." : "Verify"}
              </button>
            </div>
          ) : (
            <div style={styles.chatContainer}>
              <div style={styles.chatBox}>
                {chatHistory.map((chat, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.chatBubble,
                      backgroundColor: chat.sender === "user" ? "#FF3D00" : "#F1F1F1",
                      color: chat.sender === "user" ? "white" : "black",
                      alignSelf: chat.sender === "user" ? "flex-end" : "flex-start", // Align user messages to the right
                      marginLeft: chat.sender === "user" ? "auto" : "0", // Align user messages to the right
                      marginRight: chat.sender === "user" ? "0" : "auto", // Align bot messages to the left
                    }}
                  >
                    {chat.sender === "bot" && <img src={logo} alt="Bot Logo" style={styles.botLogo} />}
                    {chat.text} {/* Display the bot's message */}
                  </div>
                ))}
              </div>
              <div style={styles.inputContainer}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress} // Handle Enter key press
                  style={styles.messageInput}
                />
                <button onClick={sendMessage} style={styles.sendButton}>
                  Send
                </button>
                <img
                  src={ttsEnabled ? speakerOn : speakerOff}
                  alt="Toggle Voice"
                  style={styles.speakerIcon}
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  title={ttsEnabled ? "Disable Vzbot voice" : "Enable Vzbot voice"}
                />
              </div>
            </div>
          )}
          <div style={styles.trademark}>
            © Code Helix @ Verizon
          </div>
          <a href="https://www.verizon.com/" style={styles.vzFamLink}>
            Become a part of VzFam!
          </a>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { 
    padding: 0, 
    margin: 0, 
    height: "100vh", // Full height for the container
    backgroundColor: "#000", // Fallback background color
    color: "#fff" 
  },
  videoContainer: { 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center", 
    height: "100vh" // Full height for video
  },
  video: { 
    width: "100%", 
    height: "auto" 
  },
  verificationContainer: { 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center", 
    justifyContent: "center", 
    height: "100vh" // Full height for verification page
  },
  heading: { 
    fontSize: "32px", 
    marginBottom: "20px" 
  },
  loginContainer: { 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center",
    width: "400px", // Set a specific width for the login container
    padding: "20px", // Add some padding for better spacing
    border: "1px solid #FF3D00", // Optional: Add a border for visibility
    borderRadius: "8px", // Optional: Add rounded corners
    backgroundColor: "#222", // Optional: Background color for the container
  },
  input: { 
    padding: 12, 
    width: "100%", // Set width to 100% to fill the container
    borderRadius: 8, 
    marginBottom: 10, 
    border: "1px solid #FF3D00", 
    backgroundColor: "#333", // Darker background for the input
    color: "white" // Set text color to white
  },
  button: { 
    padding: 12, 
    width: "100%", // Set width to 100% to fill the container
    borderRadius: 8, 
    backgroundColor: "#FF3D00", 
    color: "white", 
    fontWeight: "bold", 
    border: "none" 
  },
  chatContainer: { 
    display: "flex", 
    flexDirection: "column", 
    height: "500px", // Increased height of the chat container
    width: "500px", // Set width for the chat container
    justifyContent: "space-between" 
  },
  chatBox: { 
    height: "500px", // Increased height of the chat box
    width: "100%", // Set width for the chat box
    overflowY: "auto", 
    border: "1px solid #FF3D00", 
    borderRadius: 8, 
    padding: 10, 
    backgroundColor: "#222", 
    display: "flex", 
    flexDirection: "column" 
  },
  chatBubble: { 
    padding: "12px", 
    borderRadius: "18px", 
    margin: "5px 0", 
    display: "inline-block", 
    maxWidth: "70%", 
    wordWrap: "break-word" 
  },
  inputContainer: { 
    display: "flex", 
    alignItems: "center", 
    marginTop: 10 
  },
  messageInput: { 
    flex: 1, 
    padding: 12, 
    borderRadius: 8, 
    border: "1px solid #FF3D00", 
    backgroundColor: "#222", 
    color: "#fff" 
  },
  sendButton: { 
    padding: "12px 20px", 
    borderRadius: 8, 
    backgroundColor: "#FF3D00", 
    color: "white", 
    fontWeight: "bold", 
    border: "none" 
  },
  speakerIcon: { 
    width: "30px", 
    height: "30px", 
    marginLeft: "10px", 
    cursor: "pointer" 
  },
  botLogo: { 
    width: "20px", 
    height: "20px", 
    marginRight: "5px" 
  },
  trademark: { 
    marginTop: "20px", 
    fontSize: "12px", 
    color: "#FF3D00", 
    textAlign: "right" 
  },
  vzFamLink: {
    position: "absolute",
    right: "20px",
    bottom: "20px",
    color: "red", // Change color to bold red
    fontSize: "24px",
    fontWeight: "bold", // Make the text bold
    textDecoration: "none",
    transition: "transform 0.3s ease",
  },
};

export default App;