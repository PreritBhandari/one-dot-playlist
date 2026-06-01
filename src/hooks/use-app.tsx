import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAudioPlayer } from "@/hooks/use-audio-player";

type AppCtx = ReturnType<typeof useAuth> & {
  player: ReturnType<typeof useAudioPlayer>;
};

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const player = useAudioPlayer();
  return <Ctx.Provider value={{ ...auth, player }}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be inside AppProvider");
  return v;
}
