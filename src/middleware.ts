import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';

export const middleware = withMiddlewareAuthRequired();

export const config = {
  matcher: [
    '/collect',
    '/report',
    '/rewards',
    '/leaderboard',
    '/settings',
    '/verify'
  ]
};