# FaceSnap Tracker (GitHub Pages + iPhone Camera)

A lightweight web app for iPhone that:

- Opens the device camera.
- Runs **live face detection** with highlighted boxes.
- Lets you **tap a face** to capture a snapshot.
- Saves snapshots to temporary browser storage (`localStorage`).
- Lets you **Save / Share** each image (works with iOS Share Sheet).

## Deploy to GitHub Pages

1. Push these files to a GitHub repository.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set Source to **Deploy from a branch**.
4. Select your branch (for example `main`) and folder `/ (root)`.
5. Save.

Your app will be available at `https://<username>.github.io/<repo>/`.

## iPhone usage notes

- Open in Safari over HTTPS (GitHub Pages is HTTPS by default).
- Tap **Start Camera** and allow camera permission.
- Tap a highlighted face rectangle to capture.
- Use **Save / Share** on a capture to send to Photos/Files.
- "Clear Temp Captures" removes saved local snapshots from the browser.

## Tech

- MediaPipe Tasks Vision (`@mediapipe/tasks-vision`) for face detection.
- Plain HTML/CSS/JS (no build step).
- PWA manifest + service worker for installability.
