import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';



const supabaseUrl = 'https://rwgiiufhvyiutnjxyent.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3Z2lpdWZodnlpdXRuanh5ZW50Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2Njc1NTksImV4cCI6MjA3MjI0MzU1OX0.VDUOaTRnPzcHfiv93TO9prbLBuWnbT_zUrzdZNN-Rtk';
                        

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Keeps user logged in even after closing app
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});





