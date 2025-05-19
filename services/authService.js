import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "supabase.session";

export const saveSession = async () => {
  const session = supabase.auth.session();
  if (session) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
};

export const restoreSession = async () => {
  const sessionStr = await AsyncStorage.getItem(STORAGE_KEY);
  if (sessionStr) {
    const session = JSON.parse(sessionStr);
    await supabase.auth.setSession(session);
  }
};

export const signOut = async () => {
  await supabase.auth.signOut();
  await AsyncStorage.removeItem(STORAGE_KEY);
};
