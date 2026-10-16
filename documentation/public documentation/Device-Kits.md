# AriannA Device Components

## Source layout

```text
components/
  mobile/
    core/ controls/ inputs/ layout/ navigation/ feedback/ gestures/ system/
  watch/
  tv/
additionals/mobile/
kits/
  ios/ android/ apple/ wearos/ android-tv/
```

`components` contains portable AriannA UI. `additionals/mobile` contains capability services and the native bridge. `kits` contains platform integration sources; application permissions, entitlements and delegate presentation remain owned by the host application.

## Mobile components

| Group | Exports |
|---|---|
| core | `MobileElement`, `MobileStyles` |
| controls | `MobileButton`, `MobileIconButton`, `FloatingActionButton`, `MobileSwitch`, `MobileSlider`, `MobileStepper`, `SegmentedControl`, `MobileCheckbox`, `MobileRadio`, `MobileProgress`, `ActivityIndicator`, `MobileChip`, `MobileBadge`, `MobilePageControl`, `MobileRangeSlider` |
| inputs | `MobileTextField`, `MobileSearchBar`, `MobileDatePicker`, `MobileTimePicker`, `MobilePicker` |
| layout | `SafeArea`, `KeyboardAvoidingView`, `MobileScrollView`, `MobileCard`, `MobileDivider`, `MobileGrid`, `MobileList`, `MobileCollection` |
| navigation | `NavigationBar`, `BottomNavigation`, `TopAppBar`, `MobileTabBar`, `MobileToolbar`, `NavigationDrawer` |
| feedback | `ActionSheet`, `BottomSheet`, `MobileDialog`, `MobileAlert`, `MobileSnackbar`, `MobileToast`, `MobileContextMenu` |
| gestures | `PullToRefresh`, `SwipeActions` |
| system | `Camera`, `MediaPicker`, `ShareButton`, `PermissionDialog`, `IdentityCardReader` |

All controls accept `theme="dark|light"`; mobile controls also resolve `platform="ios|android|web"`. Events use the `arianna:*` prefix and bubble through both light and Shadow DOM.

## Watch and TV

Watch exports `WatchApp`, `WatchNavigation`, `DigitalCrown`, and `WatchComplication`. TV exports `TVApp`, `TVShelf`, `TVFocusGuide`, and `TVPlayerControls`. The TV focus guide consumes arrow keys/D-pad input; the crown consumes rotary wheel input.

## Native adapter

Install the Tauri adapter only after registering the native plugin:

```ts
import { TauriMobileAdapter } from 'arianna/additionals';
TauriMobileAdapter.Install();
```

`NativeBridge.Available(command)` reports only commands declared by the adapter. Merely running inside Tauri is not treated as proof that Camera, NFC or biometric plugins exist.

The Swift and Kotlin kits deliberately reject operations requiring a host view-controller, ActivityResult callback, NFC lifecycle or secure CIE/PACE implementation until the host supplies that integration. They never return a false success.

## Required package exports

```ts
// components/index.ts
export * from './mobile/index.ts';
export * from './watch/index.ts';
export * from './tv/index.ts';

// additionals/index.ts
export * as Mobile from './mobile/index.ts';
```

Rebuild both bundles after changing those files. Playground logs `[device-kits]` with the exact loaded Components URL and export types.
