##  Basic Details

### **Team Name:** 404 Brain Not Found

### **Team Members**
* **Aswini Jayakumar** – *Muthoot Institute of Technology and Science, Kochi*
* **Dhanyasree S** – *Muthoot Institute of Technology and Science, Kochi*

---

##  Project Overview

### **Project Description**
**The Human Error Simulator** is a dystopian corporate terminal web application built to test your humanity through hostile anti-UX modules. Every interaction is designed to frustrate, confuse, and ultimately classify you as either a *"defective carbon-based unit"* or *"suspiciously competent."* 

Navigate through four brutal modules featuring real-time camera motion penalties (powered by MediaPipe & TensorFlow.js), a passive-aggressive gaslighting AI assistant, CRT scanline immersion, custom lagging cursor physics, audio assaults, and a psychological final evaluation profile.

---

### **The Problem (that doesn't exist)**
Humans are becoming far too confident in their digital interactions. They navigate user interfaces with reckless precision, rarely make mistakes, and have completely forgotten the joy of being verbally degraded by a judgmental corporate terminal for being biologically inferior. This lack of emotional damage was a critical void in modern software engineering.

---

### **The Solution (that nobody asked for)**
We built a web terminal that actively punishes you for existing. Every keystroke, mouse trajectory, and second of hesitation is logged, evaluated, and penalized. Upon failing hostile prompts, users face real-time computer vision challenges—such as posing cutely (*Ruby Chan* style) or performing synchronized hand dances. Supported by constant gaslighting, error pop-up floods, and audio assaults, the simulator concludes by assigning you an official classification ranging from **"SUSPICIOUSLY COMPETENT"** to **"RECOMMENDED FOR IMMEDIATE AUTOMATION."**

---

##  Screenshots & Showcase

### **Main Directory Interface**
<img width="1600" height="738" alt="3b9c0ad2-2fa0-4007-84a9-e7f4e302f0eb" src="https://github.com/user-attachments/assets/76398ec3-2308-42bb-ba2a-044bddaf1049" />
*Overview of the primary anti-UX terminal interface, active telemetry monitor, and navigation systems.*

---

##  Project Demo

* **Demo Video Link:** https://drive.google.com/drive/folders/1q0KJqSY2jr1r9xq4mhxv99C2ALoOJA1o?usp=drive_link
* **Video Overview:** Demonstrates custom lagging cursor physics, reverse-typing traps, real-time MediaPipe gesture penalties, GaslightBot interactions, and post-credit Fox video loops.

---

##  Technical Details

### **Tech Stack**

#### **Software**
* **Language:** TypeScript, CSS3
* **Framework:** TanStack Start (React 19)
* **Styling:** Tailwind CSS 4, `tw-animate-css`, Custom CRT Scanline Engine
* **UI Components:** shadcn/ui (Radix UI Primitives), Lucide React
* **Build Tool:** Vite 8
* **Computer Vision & ML:**
  * `@mediapipe/face_mesh`
  * `@mediapipe/hands`
  * `@mediapipe/camera_utils`
  * `@tensorflow/tfjs`
  * `@tensorflow-models/face-landmarks-detection`
  * `@tensorflow-models/hand-pose-detection`
* **Audio & FX:** Web Audio API (`OscillatorNode` synthesizer), `canvas-confetti`

#### **Hardware Dependencies**
* Webcam (for real-time pose and gesture verification)
* Speakers / Headphones (for audio feedback and punishment tracks)
* Keyboard & Mouse / Trackpad

---

##  Key Features & System Architecture

### 1.  Motion Detection Engine (Strict Vision Verification)

| Penalty Module | Trigger Condition | Motion Requirements | Timeout Behavior |
| :--- | :--- | :--- | :--- |
| **Module 1: Ruby Chan Pose** | Fast/Slow typing, Backspacing | • Head tilted >15° (FaceMesh)<br>• Hand touching cheek/chin (Hands)<br>• 2-second continuous hold | 15s timeout $\rightarrow$ "POSE FAILED" shame message |
| **Module 2: Hand Movement Dance** | Landing on 73%, Clicking submit | • Both hands detected & moving<br>• Vertical amplitude >30% screen height<br>• 5 complete synchronized cycles (within 200ms) | 12s timeout $\rightarrow$ "MOVEMENT FAILED" shame message |
| **Module 4: Audio/Video Loop** | Answering any 2+2 question | • Plays `crazy_frog.mpeg`<br>• Followed by 3x sequential `fox.mp4` loops | Screen input locked during playback |

---

### 2. Anti-UX & Brutal Error System
* **Custom Lagging Cursor Engine:** Disables native cursor (`cursor: none`), replaces with glowing reticle moving at 150ms LERP delay (`x += (targetX - x) * 0.15`). Detects swipe velocity (>80px in <16ms).
* **Synthesizer Audio Assault:** Web Audio API FM-modulated square wave dual tones (800Hz / 1200Hz) paired with long haptic vibration patterns via `navigator.vibrate`.
* **Error Popup Flood:** Spawns 6–8 overlapping dialog boxes at randomized coordinates and rotations (-5° to +5°). Execution remains locked until every popup is cleared.
* **System Freeze Effect:** 20% chance per error to simulate a 2.5-second system unresponsive state complete with red screen blur, spinning loaders, and input locks.

---

### 3.  Passive-Aggressive Gaslighting Assistant (GaslightBot)
* Fixed animated bot monitoring idle durations (>4 seconds of inactivity).
* **Intellectual Aid (Hint Button):** Deducts 20% humanity score, logs an initiative penalty, and displays full-screen warning banners.
* **Skip Button:** Flags asset as "non-viable" and logs cowardice stats into terminal telemetry.

---

### 4.  Final Assessment & Defect Profile
Evaluates aggregate performance across all four modules based on total defects accrued:
* **$\ge$ 18 Defects:** `RECOMMENDED FOR IMMEDIATE AUTOMATION` 
* **$\ge$ 12 Defects:** `SALVAGEABLE ONLY AS TRAINING DATA` 
* **$\ge$ 6 Defects:** `PROVISIONAL CARBON UNIT — SUPERVISION REQUIRED` 
* **< 6 Defects:** `SUSPICIOUSLY COMPETENT — SYNTHETIC ORIGIN SUSPECTED` 

---

##  Installation & Local Development

### **Prerequisites**
* Node.js (v18+) or Bun runtime
* Web camera access enabled in browser

### **Setup Commands**

```bash
# 1. Clone the repository
git clone https://github.com/dhanyasree143/useless_project_temp
# 2. Navigate into the project directory
cd useless_project_temp

# 3. Install dependencies
npm install
# OR
bun install

# 4. Start the development server
npm run dev
# OR
bun run dev
