import { Anton, Montserrat } from 'next/font/google';

export const anton = Anton({ 
  weight: '400', 
  subsets: ['latin'], 
  variable: '--font-anton' 
});

export const montserrat = Montserrat({ 
  subsets: ['latin'], 
  variable: '--font-montserrat' 
});