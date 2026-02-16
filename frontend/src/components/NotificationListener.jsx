import { useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { UserContext } from "../context/UserContext"; // Wherever your user context is
import { io } from "socket.io-client";
import { API_URL } from "../config";

// Use the same socket instance you use for market data
const socket = io(API_URL, { transports: ["websocket"] }); 

const NotificationListener = () => {
  const { user } = useContext(UserContext); // Get the logged-in user

  useEffect(() => {
    socket.on("personal-alert", (alertData) => {
      // ONLY show the notification if this alert belongs to the logged-in user!
      if (user && user._id === alertData.userId) {
        toast.info(`${alertData.title}: ${alertData.message}`, {
          position: "top-right",
          autoClose: 8000,
          theme: "dark",
        });
      }
    });

    return () => socket.off("personal-alert");
  }, [user]);

  return null; // This component doesn't render anything visible, it just listens!
};

export default NotificationListener;