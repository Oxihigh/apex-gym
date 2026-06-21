export function register() {
  if ('serviceWorker' in navigator && (import.meta.env.PROD || (window as any).enableDevSW)) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Oxihigh Gym Service Worker registered: ', registration.scope);
        })
        .catch((registrationError) => {
          console.error('Oxihigh Gym Service Worker registration failed: ', registrationError);
        });
    });
  }
}
