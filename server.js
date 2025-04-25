const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let screens = [];
let admin = null;

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    
    if (data.type === 'screen_connect') {
      screens.push(data.id);
      if (admin) admin.send(JSON.stringify({ type: 'screen_list', screens }));
    } else if (data.type === 'admin_connect') {
      admin = ws;
      admin.send(JSON.stringify({ type: 'screen_list', screens }));
    } else if (data.type === 'update') {
      wss.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          if (data.screen === 'all' || client.id === data.screen) {
            client.send(JSON.stringify({ type: 'update', payload: data.payload }));
          }
        }
      });
    }
  });

  ws.on('close', () => {
    screens = screens.filter(id => id !== ws.id);
    if (ws === admin) admin = null;
    if (admin) admin.send(JSON.stringify({ type: 'screen_list', screens }));
  });
});

console.log('WebSocket server running on ws://localhost:8080');
