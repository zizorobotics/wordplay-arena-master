# Multi-Device Testing Instructions

## Setup for Testing Across Devices

### 1. Find Your Computer's IP Address
On your computer, open Command Prompt (Windows) or Terminal (Mac/Linux) and run:
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

Look for your local IP address (usually starts with `192.168.x.x` or `10.0.x.x`)

### 2. Start the Servers

#### Backend Server (Port 8085)
```bash
cd server
$env:PORT="8085"; & "C:\Users\Ziad\AppData\Local\Pub\Cache\bin\dart_frog.bat" dev
```

#### Frontend Server (Port 8080)
```bash
npm run dev:client
```

### 3. Access from Different Devices

#### From Your Computer:
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:8085`

#### From Your Phone (same WiFi):
- Frontend: `http://YOUR_COMPUTER_IP:8080`
- Backend: `http://YOUR_COMPUTER_IP:8085`

### 4. Test Multiplayer

1. **Open the game on your computer**: `http://localhost:8080`
2. **Open the game on your phone**: `http://YOUR_COMPUTER_IP:8080`
3. **Start matchmaking on both devices** with the same settings
4. **They should find each other** and start a game

### 5. Anonymous User Testing

- **Each device will have a different IP**, so they'll get different anonymous user IDs
- **Same device = same anonymous user** (cached IP)
- **Different devices = different anonymous users**

### 6. Troubleshooting

#### If devices can't connect:
1. **Check firewall settings** - Allow ports 8080 and 8085
2. **Check WiFi network** - Both devices must be on same network
3. **Try different ports** if 8080/8085 are blocked

#### If matchmaking doesn't work:
1. **Check server logs** for errors
2. **Verify both devices can access the backend**
3. **Try refreshing both pages**

### 7. Example Network Setup

```
Your Computer (192.168.1.100):
├── Frontend: http://localhost:8080
├── Backend: http://localhost:8085
└── Anonymous User: Anonymous123456

Your Phone (192.168.1.101):
├── Frontend: http://192.168.1.100:8080
├── Backend: http://192.168.1.100:8085
└── Anonymous User: Anonymous789012
```

### 8. Testing Different Scenarios

1. **Anonymous vs Anonymous**: Both devices without signing in
2. **Anonymous vs Registered**: One device signed in, one anonymous
3. **Registered vs Registered**: Both devices signed in
4. **Multiple Games**: Start multiple games simultaneously

This setup allows you to test the full multiplayer experience across different devices on your local network! 