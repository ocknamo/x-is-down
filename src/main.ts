import './app.css'
import App from './App.svelte'
import { mount } from 'svelte'
import { createConsoleViewer } from 'console-daijin'

if (window.self !== window.top) {
  createConsoleViewer()
}

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
