import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useAudioPlayer } from "@/hooks/use-audio-player";
import { usePlaylists } from "@/hooks/use-library";
import { useSpotify } from "@/hooks/use-spotify";

type AppCtx = ReturnType<typeof useAuth> & {
  player: ReturnType<typeof useAudioPlayer>;
  playlists: ReturnType<typeof usePlaylists>;
  spotify: ReturnType<typeof useSpotify>;
};

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const player = useAudioPlayer();
  const playlists = usePlaylists();
  const spotify = useSpotify();
  return (
    <Ctx.Provider value={{ ...auth, player, playlists, spotify }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useApp must be inside AppProvider");
  return v;
}
