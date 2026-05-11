export {}

declare global {
  interface Window {
    currentUser: import('./index').User
  }
}
