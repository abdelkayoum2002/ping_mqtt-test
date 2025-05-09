import mqtt from 'mqtt';

const BROKER_URL = 'mqtt://broker.emqx.io:1883';
const clientId = 'monitor_' + Math.random().toString(16).slice(2, 6);

const baseTopic = 'esp32/status/ping';
const wildcardResponseTopic = `${baseTopic}/+`;

const client = mqtt.connect(BROKER_URL, { clientId });

let pingStart = null;

client.on('connect', () => {
  console.log(`✅ Monitor connected as ${clientId}`);

  client.subscribe(wildcardResponseTopic, (err) => {
    if (err) return console.error('❌ Subscribe failed:', err);
    console.log(`📡 Subscribed to: ${wildcardResponseTopic}`);
  });

  // Periodic ping
  setInterval(() => {
    pingStart = Date.now();
    client.publish(baseTopic, '');
    console.log('📤 Ping sent to', baseTopic);
  }, 5000); // every 5 seconds
});

client.on('message', (topic, messageBuffer) => {
  const now = Date.now();
  try {
    const from = topic.split('/').pop();
    const latency = now - pingStart;
    console.log(`⏱️ RTT from ${from}: ${latency} ms`);
  } catch (err) {
    console.error('❌ Parse error:', err.message);
  }
});

client.on('error', (err) => {
  console.error('❌ MQTT error:', err.message);
});
