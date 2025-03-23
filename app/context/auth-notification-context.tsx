"use client";

import { createContext, useContext, type ReactNode } from "react";
import { toast } from "sonner";

type AuthAction = "login" | "register" | "logout";

type AuthNotificationContextType = {
  showAuthNotification: (action: AuthAction, username?: string) => void;
};

const AuthNotificationContext = createContext<AuthNotificationContextType | undefined>(undefined);

export function AuthNotificationProvider({ children }: { children: ReactNode }) {
  const showAuthNotification = (action: AuthAction, username?: string) => {
    switch (action) {
      case "login":
        toast.success("Welcome back!", {
          description: username ? `You are now logged in as ${username}` : "You are now logged in",
          duration: 3000,
        });
        break;
      case "register":
        toast.success("Registration successful!", {
          description: username ? `Welcome to Holidayz, ${username}. You can now log in with your credentials.` : "Your account has been created successfully. You can now log in.",
          duration: 3000,
        });
        break;
      case "logout":
        toast.info("Logged out", {
          description: "You have been logged out successfully",
          duration: 3000,
        });
        break;
    }
  };

  return <AuthNotificationContext.Provider value={{ showAuthNotification }}>{children}</AuthNotificationContext.Provider>;
}

export function useAuthNotification() {
  const context = useContext(AuthNotificationContext);
  if (context === undefined) {
    throw new Error("useAuthNotification must be used within an AuthNotificationProvider");
  }
  return context;
}
