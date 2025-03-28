import { User } from '@auth0/nextjs-auth0';

declare module '@auth0/nextjs-auth0' {
  interface User {
    id?: number;
    totalPoints?: number;
    totalWaste?: number;
    totalReports?: number;
  }
}