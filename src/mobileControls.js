import * as THREE from "three";

/**
 * Detects if the current device is a mobile/touch device
 */
export function isMobile() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0
  ) && window.innerWidth <= 1024;
}

/**
 * MobileControls handles all touch-based input for mobile devices:
 * - Touch camera look (drag on screen to rotate)
 * - Virtual joystick for movement
 * - Action buttons (jump, sprint, break, place)
 */
export class MobileControls {
  // Touch look state
  lookTouchId = null;
  lookTouchStartX = 0;
  lookTouchStartY = 0;
  lookSensitivity = 0.004;
  cameraPitch = 0; // accumulated pitch (clamped)

  // Joystick state
  joystickTouchId = null;
  joystickCenterX = 0;
  joystickCenterY = 0;
  joystickMaxRadius = 45; // max drag distance in px
  joystickActive = false;

  // Sprint state
  isSprinting = false;

  constructor(player, world, blockActionCallback) {
    this.player = player;
    this.world = world;
    this.blockActionCallback = blockActionCallback; // (action) => void, action = 'break' | 'place'

    // DOM elements
    this.joystickArea = document.getElementById("joystick-area");
    this.joystickBase = document.getElementById("joystick-base");
    this.joystickThumb = document.getElementById("joystick-thumb");
    this.btnJump = document.getElementById("btn-jump");
    this.btnSprint = document.getElementById("btn-sprint");
    this.btnBreak = document.getElementById("btn-break");
    this.btnPlace = document.getElementById("btn-place");
    this.mobileControls = document.getElementById("mobile-controls");

    this.setupTouchLook();
    this.setupJoystick();
    this.setupButtons();
    this.setupToolbarTouch();
  }

  /**
   * Show mobile controls UI
   */
  show() {
    if (this.mobileControls) {
      this.mobileControls.style.display = "block";
    }
  }

  /**
   * Hide mobile controls UI
   */
  hide() {
    if (this.mobileControls) {
      this.mobileControls.style.display = "none";
    }
  }

  /**
   * Touch-based camera look: drag anywhere on screen (that isn't a UI element)
   * to rotate the camera. We track touch by ID so joystick and look don't conflict.
   */
  setupTouchLook() {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    canvas.addEventListener("touchstart", (e) => {
      e.preventDefault();
      for (const touch of e.changedTouches) {
        // If touch is on the right half (or no joystick active on left), use for look
        if (this.lookTouchId === null && touch.clientX > window.innerWidth * 0.35) {
          this.lookTouchId = touch.identifier;
          this.lookTouchStartX = touch.clientX;
          this.lookTouchStartY = touch.clientY;
        }
      }
    }, { passive: false });

    canvas.addEventListener("touchmove", (e) => {
      e.preventDefault();
      for (const touch of e.changedTouches) {
        if (touch.identifier === this.lookTouchId) {
          const deltaX = touch.clientX - this.lookTouchStartX;
          const deltaY = touch.clientY - this.lookTouchStartY;

          // Apply yaw (left-right)
          this.player.camera.rotation.y -= deltaX * this.lookSensitivity;

          // Apply pitch (up-down) with clamping
          this.cameraPitch -= deltaY * this.lookSensitivity;
          this.cameraPitch = Math.max(-Math.PI / 2 * 0.94, Math.min(Math.PI / 2 * 0.94, this.cameraPitch));
          this.player.camera.rotation.x = this.cameraPitch;

          this.lookTouchStartX = touch.clientX;
          this.lookTouchStartY = touch.clientY;
        }
      }
    }, { passive: false });

    canvas.addEventListener("touchend", (e) => {
      for (const touch of e.changedTouches) {
        if (touch.identifier === this.lookTouchId) {
          this.lookTouchId = null;
        }
      }
    });

    canvas.addEventListener("touchcancel", (e) => {
      for (const touch of e.changedTouches) {
        if (touch.identifier === this.lookTouchId) {
          this.lookTouchId = null;
        }
      }
    });
  }

  /**
   * Virtual joystick for movement
   */
  setupJoystick() {
    if (!this.joystickArea) return;

    this.joystickArea.addEventListener("touchstart", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const touch = e.changedTouches[0];
      this.joystickTouchId = touch.identifier;
      this.joystickActive = true;

      const rect = this.joystickBase.getBoundingClientRect();
      this.joystickCenterX = rect.left + rect.width / 2;
      this.joystickCenterY = rect.top + rect.height / 2;

      this.updateJoystickVisual(touch.clientX, touch.clientY);
      this.updateJoystickInput(touch.clientX, touch.clientY);
    }, { passive: false });

    this.joystickArea.addEventListener("touchmove", (e) => {
      e.preventDefault();
      e.stopPropagation();
      for (const touch of e.changedTouches) {
        if (touch.identifier === this.joystickTouchId) {
          this.updateJoystickVisual(touch.clientX, touch.clientY);
          this.updateJoystickInput(touch.clientX, touch.clientY);
        }
      }
    }, { passive: false });

    const endJoystick = (e) => {
      for (const touch of e.changedTouches) {
        if (touch.identifier === this.joystickTouchId) {
          this.joystickTouchId = null;
          this.joystickActive = false;
          this.player.input.x = 0;
          this.player.input.z = 0;
          // Reset thumb position
          if (this.joystickThumb) {
            this.joystickThumb.style.transform = "translate(-50%, -50%)";
          }
        }
      }
    };

    this.joystickArea.addEventListener("touchend", endJoystick);
    this.joystickArea.addEventListener("touchcancel", endJoystick);
  }

  updateJoystickVisual(touchX, touchY) {
    if (!this.joystickThumb) return;

    let dx = touchX - this.joystickCenterX;
    let dy = touchY - this.joystickCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > this.joystickMaxRadius) {
      dx = (dx / dist) * this.joystickMaxRadius;
      dy = (dy / dist) * this.joystickMaxRadius;
    }

    this.joystickThumb.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
  }

  updateJoystickInput(touchX, touchY) {
    let dx = touchX - this.joystickCenterX;
    let dy = touchY - this.joystickCenterY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > this.joystickMaxRadius) {
      dx = (dx / dist) * this.joystickMaxRadius;
      dy = (dy / dist) * this.joystickMaxRadius;
    }

    // Normalize to -1..1
    const nx = dx / this.joystickMaxRadius;
    const ny = dy / this.joystickMaxRadius;

    // Map to player input: x = strafe (left/right), z = forward/back (inverted y)
    const speed = this.player.maxSpeed;
    this.player.input.x = nx * speed;
    this.player.input.z = -ny * speed; // negative because screen Y is inverted
  }

  /**
   * Action buttons
   */
  setupButtons() {
    // Jump button
    if (this.btnJump) {
      this.btnJump.addEventListener("touchstart", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.player.canJump) {
          this.player.velocity.y += this.player.jumpVelocity;
        }
      }, { passive: false });
    }

    // Sprint toggle
    if (this.btnSprint) {
      this.btnSprint.addEventListener("touchstart", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.isSprinting = !this.isSprinting;
        this.player.speedMultiplyer = this.isSprinting ? 1.5 : 1;
        this.btnSprint.classList.toggle("active", this.isSprinting);
      }, { passive: false });
    }

    // Break block
    if (this.btnBreak) {
      this.btnBreak.addEventListener("touchstart", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.blockActionCallback) {
          this.blockActionCallback("break");
        }
      }, { passive: false });
    }

    // Place block
    if (this.btnPlace) {
      this.btnPlace.addEventListener("touchstart", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (this.blockActionCallback) {
          this.blockActionCallback("place");
        }
      }, { passive: false });
    }
  }

  /**
   * Make toolbar icons respond to touch
   */
  setupToolbarTouch() {
    const toolbarIcons = document.querySelectorAll(".toolbar-icon");
    toolbarIcons.forEach((icon) => {
      icon.addEventListener("touchstart", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = parseInt(icon.id.replace("toolbar-", ""), 10);
        if (!isNaN(id)) {
          this.player.selectBlock(id);
        }
      }, { passive: false });
    });
  }

  /**
   * Called each frame — currently a no-op but reserved for future use
   */
  update() {
    // Joystick input is applied directly via touch events
    // Camera look is applied directly via touch events
  }
}
