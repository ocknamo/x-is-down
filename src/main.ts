import './app.css'
import App from './App.svelte'
import { mount } from 'svelte'
import { createConsoleViewer } from 'console-daijin'

createConsoleViewer({ show: 'iframe' })

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
