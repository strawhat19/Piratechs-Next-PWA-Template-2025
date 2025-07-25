import withPWA from 'next-pwa';
import { NextConfig } from 'next';

const routes = {
  gallery: { authenticated: ``, redirects: [`pictures`, `images`], icons: { fontAwesome: `fa-images`, mui: `PremMedia` } },
  settings: { authenticated: `Moderator`, redirects: [`config`, `general`], icons: { fontAwesome: `fa-cog`, mui: `Settings` } },
  chats: { authenticated: `User`, redirects: [`chat`, `message`, `messages`], icons: { fontAwesome: `fa-comments`, mui: `Chat` } },
  notifications: { authenticated: `User`, redirects: [`alerts`, `notification`], icons: { fontAwesome: `fa-bell`, mui: `Notifications` } },
  profile: { authenticated: `User`, redirects: [`edit`, `account`, `preferences`, `account`], icons: { fontAwesome: `fa-user`, mui: `Person` } },
  signup: { authenticated: ``, redirects: [`new`, `sign-up`, `register`, `subscribe`], icons: { fontAwesome: `fa-user-plus`, mui: `PersonAdd` } },
  signin: { authenticated: ``, redirects: [`log`, `sign`, `login`, `log-in`, `sign-in`], icons: { fontAwesome: `fa-sign-in-alt`, mui: `Login` } },
  styles: { authenticated: ``, redirects: [`theme`, `design`, `components`, `typography`], icons: { fontAwesome: `fa-paint-brush`, mui: `Brush` } },
  contact: { authenticated: ``, redirects: [`contactme`, `contactus`, `getintouch`, `get-in-touch`, `contact-me`], icons: { fontAwesome: `fa-envelope`, mui: `Mail` } },
  about: { authenticated: ``, redirects: [`info`, `aboutus`, `company`, `aboutme`, `about-us`, `about-me`], icons: { fontAwesome: `fa-info-circle`, mui: `Info` } },
  stocks: { authenticated: `User`, redirects: [`investing`, `invest`, `portfolio`, `stock`, `holdings`], icons: { fontAwesome: `fa-info-circle`, mui: `Info` } },
}

const nextConfig: NextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  rewrites: async () => Object.keys(routes).map(key => ({ source: `/${key}`, destination: `/pages/${key}` })),
  redirects: async () => Object.entries(routes).flatMap(([key, route]) => route.redirects.map(alias => ({ source: `/${alias}`, destination: `/${key}`, permanent: true }))),
};

export default withPWA({
  dest: `public`,
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV !== `production`,
})(nextConfig as any);