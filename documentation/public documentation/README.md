# AriannA device kits

- `ios/`: Tauri 2 Swift plugin skeleton for iOS. Working synchronous capabilities are wired; features that require a host view-controller, entitlement or lifecycle delegate fail explicitly instead of reporting false availability.
- `android/`: Tauri 2 Kotlin plugin skeleton for Android with manifest capabilities and explicit host-delegate boundaries.
- `apple/`: watchOS/tvOS Swift helpers.
- `wearos/`: Wear OS rotary input helper.
- `android-tv/`: Android TV D-pad helper.

The web components are in `components/mobile`, `components/watch` and `components/tv`. Native kits are adapters, not alternative UI implementations. Camera, media picker, biometrics and NFC require the host application to connect the platform callback indicated by the thrown message. Secure CIE chip access is not claimed: it requires PACE, ISO 7816, certificates and platform entitlements.
