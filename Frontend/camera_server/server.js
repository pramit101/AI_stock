const express = require('express');
const cors = require('cors');
const Stream = require('node-rtsp-stream');

const app = express();
app.use(cors());

// Replace with your camera details
const CAMERA_IP = '172.20.10.2';
const CAMERA_USERNAME = 'Pramit';
const CAMERA_PASSWORD = '439BC51b8b@@';
const RTSP_URL = `rtsp://${CAMERA_USERNAME}:${CAMERA_PASSWORD}@${CAMERA_IP}:554/stream1`;

// Create RTSP to WebSocket stream
const stream = new Stream({
  name: 'tapo-camera',
  streamUrl: RTSP_URL,
  wsPort: 9999,
  ffmpegOptions: {
    '-stats': '',
    '-r': 30
  }
});

app.get('/', (req, res) => {
  res.send('Tapo Camera Stream Server Running');
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket stream available on ws://localhost:9999`);
});