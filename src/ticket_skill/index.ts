import { createApp } from 'vue';
import App from './App.vue';
import './styles/ticket.css';

$(() => {
  const app = createApp(App);
  app.mount('#ticket-skill-root');
  $(window).on('pagehide', () => app.unmount());
});
