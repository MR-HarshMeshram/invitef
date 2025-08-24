import React from "react";
import axios from "axios";

const LogoutButton = () => {
              const handleLogout = async () => {
                            try {
                                          await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/logout1`, {}, {
                                                        withCredentials: true
                                          });
                                          console.log("Logged out successfully");
                                          window.location.href = "/"; // Redirect after logout
                            } catch (error) {
                                          console.error("Logout failed:", error);
                            }
              };

              return (
                            <button
                                          onClick={handleLogout}
                                          className="px-4 py-2 bg-red-500 text-white rounded"
                            >
                                          Logout
                            </button>
              );
};

export default LogoutButton;
