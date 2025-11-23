import { createApp } from 'vue';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const app = createApp(App);
app.mount(rootElement);