# Testing HEARTH on iPhone via Termius

## Quick Start

### 1. Start the Dev Server (in VM)

```bash
cd ~/projects/HEARTH
npm run dev
```

The server will start on port 3000 and be accessible from your network.

### 2. Access from iPhone Browser

Open Safari on your iPhone and navigate to:

**Via Tailscale (Recommended):**
```
http://100.97.175.96:3000
```

**Via Local Network (if on same network):**
```
http://192.168.64.30:3000
```

### 3. Test Both Versions Side-by-Side

**Old Version (Production):**
- Visit: https://hearth.thorcollective.com

**New Version (Dev Server):**
- Visit: http://100.97.175.96:3000

## Features to Test on Mobile

### ✅ Responsive Design
- [ ] Mobile layout (single column grid)
- [ ] Filter panel collapses/expands
- [ ] Touch-friendly tap targets
- [ ] Hunt cards display properly
- [ ] Modal opens full-screen

### ✅ Touch Interactions
- [ ] Tap hunt card to open modal
- [ ] Swipe to close modal (if implemented)
- [ ] Touch filter chips to toggle
- [ ] Scroll pagination works smoothly

### ✅ Search & Filters
- [ ] On-screen keyboard doesn't break layout
- [ ] Search input focus works
- [ ] Filter dropdown accessible on mobile
- [ ] Clear buttons easy to tap

### ✅ Performance
- [ ] Page loads in <3 seconds on mobile
- [ ] Scrolling is smooth (60fps)
- [ ] No layout shift during load
- [ ] Images load properly

### ✅ Chat Widget
- [ ] Widget button accessible on mobile
- [ ] Chat opens in mobile-friendly view
- [ ] Keyboard doesn't obscure chat input
- [ ] Messages display properly

## Troubleshooting

### Can't Access Dev Server?

**Check Firewall:**
```bash
# On VM, ensure port 3000 is open
sudo ufw status
sudo ufw allow 3000/tcp  # If needed
```

**Verify Server is Running:**
```bash
# On VM
curl http://localhost:3000
```

**Check Tailscale Connection:**
```bash
# On iPhone, open Termius and run:
ping 100.97.175.96
```

### Alternative: Use ngrok for Public URL

If Tailscale isn't working:

```bash
# On VM, install ngrok (one-time)
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# Start ngrok tunnel
ngrok http 3000
```

This gives you a public URL like: `https://abc123.ngrok.io`

## Running in Background

To keep dev server running while you disconnect from Termius:

```bash
# Start in tmux window
tmux new -s hearth-dev
cd ~/projects/HEARTH
npm run dev

# Detach: Ctrl+b, then d
# Reattach later: tmux attach -s hearth-dev
```

## Tips for Mobile Testing

1. **Use Mobile Safari's Dev Tools:**
   - Connect iPhone to Mac via USB
   - Safari > Develop > [Your iPhone] > [Page]
   - Inspect console for errors

2. **Test in Portrait AND Landscape:**
   - Rotate device to check both orientations
   - Ensure layout adapts properly

3. **Test with Slow Connection:**
   - Safari > Settings > Experimental Features > Slow Network Simulation
   - Verify performance on 3G/4G speeds

4. **Take Screenshots:**
   - Screenshot any bugs or layout issues
   - Send to VM for debugging

## Next Steps After Mobile Testing

1. Fix any mobile-specific issues discovered
2. Update responsive CSS if needed
3. Test on different screen sizes (iPad, etc.)
4. Run Lighthouse mobile audit
5. Deploy to staging when ready
