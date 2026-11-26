# WHEEL CART — Guided WebXR AR stage

This stage is isolated at `/ar.html`. It does not replace the existing prototype or modify the `main` branch.

## What this stage implements

- A dedicated WebXR immersive-AR page using the existing Three.js dependency and wheel assets.
- A single Three.js renderer and scene for the live AR session; the GLTF alloy is not rendered into an independent 2D overlay canvas.
- Guided placement: the user aims the reticle at the centre of the real wheel and taps to place.
- WebXR hit testing to obtain a real-world pose.
- WebXR anchors when the device/browser supports them, with a local-reference-space pose fallback.
- Physical diameter input in millimetres, used to scale the 3D model in metres.
- Model selection between the two existing wheel assets.

## Important limitations

This is a real 3D world-anchored AR placement prototype, not yet a production wheel-replacement system.

- It does not automatically detect or segment a vehicle wheel.
- It does not estimate wheel diameter; the user must measure and enter it.
- Hit testing depends on the browser's AR implementation and its understanding of the visible surface. Some devices may fail to produce a hit on a curved, reflective tyre/rim.
- World anchoring keeps the alloy fixed in the tracked scene. It does not yet track a vehicle or wheel that moves independently of the environment.
- No depth-based occlusion, tyre masking, photometric relighting, or wheel-specific pose refinement is implemented yet.
- WebXR immersive AR is not universally available, particularly on iOS Safari. Test on an ARCore-supported Android device and a current Chrome build over HTTPS.

## Run locally

```bash
npm install
npm run dev -- --host 0.0.0.0
```

Open `/ar.html` on a supported phone over a secure origin (HTTPS). Localhost is treated as secure on the development machine, but a phone opening a computer's LAN IP generally needs HTTPS for camera/AR permissions.

## Next engineering stages

1. Test hit-test quality on several real vehicles, wheel finishes, distances, and lighting conditions.
2. Add a guided wheel-plane calibration flow (centre + four rim-edge points) and derive an ellipse/plane estimate rather than relying on a single hit.
3. Add wheel-specific visual tracking/pose refinement so the anchor can be re-acquired after tracking loss and can follow a vehicle if it moves.
4. Add depth occlusion and tyre-aware masking where supported.
5. Validate physical scale against known rim dimensions and normalize both supplied GLTF assets to a documented local axis/origin convention.
6. Add automated browser/device tests and production deployment configuration.

Do not describe the current stage as automatic wheel recognition or complete commercial-grade replacement.
