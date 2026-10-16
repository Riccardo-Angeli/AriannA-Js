# AriannA Mobile

`components/mobile` contains visual controls. `additionals/mobile` contains platform services. The same API is used on Web, iOS and Android; unsupported browser capabilities are delegated to an injected native adapter or to the Tauri plugin command namespace `plugin:arianna-mobile|*`.

## Components

- `SafeArea`, `NavigationBar`, `BottomNavigation`, `KeyboardAvoidingView`
- `ActionSheet`, `BottomSheet`, `SegmentedControl`
- `MobileSwitch`, `MobileSlider`, `MobileStepper`
- `PullToRefresh`, `SwipeActions`
- `Camera`, `MediaPicker`, `ShareButton`, `PermissionDialog`
- `IdentityCardReader`

All controls support `theme="dark|light"`, Direct construction and Markup.

```ts
const camera = new Camera({ Facing: 'environment' });
stage.append(camera);
await camera.Open();
camera.addEventListener('arianna:capture', event => console.log(event.detail));
```

```html
<arianna-safe-area top bottom>
  <arianna-navigation-bar title="Documents" back></arianna-navigation-bar>
  <arianna-camera facing="environment"></arianna-camera>
</arianna-safe-area>
```

## Services

The `Mobile` namespace exports `Platform`, `Permissions`, `Camera`, `MediaLibrary`, `Haptics`, `Biometrics`, `Geolocation`, `Notifications`, `Orientation`, `Keyboard`, `Connectivity`, `Clipboard`, `DeepLinks`, `NFC`, `Share`, `Lifecycle`, `IdentityCardReader` and `NativeBridge`.

```ts
import { Mobile } from 'arianna/additionals';

await Mobile.Permissions.Request('camera');
await Mobile.Haptics.Impact('selection');
const position = await Mobile.Geolocation.Current({ HighAccuracy: true });
```

## Native adapter

Browser APIs are used where they exist. A Tauri application can provide native-only operations either with an `arianna-mobile` plugin or by injecting an adapter:

```ts
Mobile.NativeBridge.Use({
  IsAvailable: command => command === 'identity_card_read',
  Invoke: (command, payload) => invoke(`plugin:my-mobile|${command}`, payload)
});
```

The canonical native commands are:

| Command | Input | Output |
| --- | --- | --- |
| `permission_query` | `{ name }` | `granted | denied | prompt | unsupported` |
| `permission_request` | `{ name }` | permission state |
| `camera_torch` | `{ enabled }` | void |
| `camera_focus` | `{ x, y }` | void |
| `media_pick` | `{ kind, multiple }` | `MediaAsset[]` |
| `media_save` | `{ name, mime, bytes }` | void |
| `haptic_impact` | `{ style }` | void |
| `biometric_authenticate` | `{ reason }` | `BiometricResult` |
| `notification_show` | notification fields | void |
| `orientation_lock` | `{ mode }` | void |
| `orientation_unlock` | none | void |
| `nfc_scan` | none | `NFCRecord[]` |
| `nfc_write` | `{ records }` | void |
| `share_open` | share fields | void |
| `identity_card_read` | `{ can, mrz, readPortrait }` | `IdentityCardData` |

## iOS permissions

Merge these keys through `src-tauri/Info.ios.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>The app uses the camera to capture documents and media.</string>
<key>NSMicrophoneUsageDescription</key>
<string>The app uses the microphone while recording video.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>The app lets you choose media from your library.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>The app saves media you explicitly create.</string>
<key>NFCReaderUsageDescription</key>
<string>The app reads an identity card after your explicit request.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>The app uses your location only while this feature is active.</string>
<key>NSFaceIDUsageDescription</key>
<string>The app uses Face ID to confirm your identity.</string>
```

Enable Near Field Communication Tag Reading in Signing & Capabilities when the native CIE adapter is installed.

## Android permissions

Declare only capabilities used by the application:

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.NFC" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-feature android:name="android.hardware.nfc" android:required="false" />
<uses-feature android:name="android.hardware.camera.any" android:required="false" />
```

Runtime permission requests are still required for dangerous Android permissions.

## Identity card reader

`IdentityCardReader.ParseMRZ` parses an ICAO TD1 MRZ (three lines of 30 characters), normalises the identity fields and verifies document-number, birth-date, expiry-date and composite check digits.

```ts
const data = Mobile.IdentityCardReader.ParseMRZ(mrz);
if (!data.ChecksValid) throw new Error('Invalid MRZ checksums');
```

```html
<arianna-identity-card-reader read-portrait></arianna-identity-card-reader>
```

Electronic identity cards are ISO 7816 secure documents, not ordinary NDEF tags. Reading the chip requires the native adapter, user consent and the access value required by the document (CAN or MRZ-derived key). AriannA does not persist the CAN, MRZ, portrait or returned identity. The host application decides whether and how to retain data and is responsible for applicable privacy law, purpose limitation and deletion policy.

