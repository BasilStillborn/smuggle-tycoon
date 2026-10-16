# Session Context — Motion Compensation for AMS2 + Quest 3

## Hardware
- **Headset:** Meta Quest 3 (serial: 2G0YC1ZG1T057N)
- **Tracker:** WitMotion WT901C-232 — data fed through SimHub or Sim Racing Studio
- **Motion rig:** Controlled by SimHub

## Software Stack
- **SteamVR v2.16.7** — VR runtime AND active OpenXR runtime
- **OpenXR-MC v0.3.10.0-beta** — OpenXR API layer for motion compensation (layer loads, audio works)
- **OVRMC v0.3.6** — Legacy OpenVR Motion Compensation (SteamVR driver disabled via `enable: false`)
- **OpenComposite** — `openvr_api.dll` bridges AMS2's OpenVR calls → OpenXR (built into SteamVR v2.16.7)
- **SimHub** — Hosts motion rig data (not used for MC currently; OpenXR-MC uses `testrotation=1`)
- **AMS2 (Automobilista 2)** — Uses rF2/madness engine; OpenVR ONLY (no native OpenXR support)
- **Aces of Thunder** — Reference game where OpenXR-MC overlay works correctly (native OpenXR game)

## Current Status

**✅ WORKING:**
- VR mode in AMS2 via OpenComposite (OpenVR→OpenXR bridge) → OpenXR-MC layer → SteamVR runtime → Quest 3
- OpenXR-MC layer loads: "XR_APILAYER_NOVENDOR_motion_compensation layer (beta - 0.3.10.0 [x64]) is active"
- 10-second audio countdown plays on game launch
- Motion compensation toggles (Ctrl+Ins) — `testrotation=1` enabled so compensation activates without tracker
- Crosshair overlay visible (rendered into game swapchain via quad layer)
- Passthrough mode shows solid pink (confirms projection layer IS created and submitted)
- OpenComposite DLL restored to original (`openvr_api.dll`, 2.4MB)

**❌ NOT WORKING:**
- 3D marker arrows (3 rotating arrows) do not render — projection layer textures show cleared pink color only
- Crosshair renders fine, but 3D meshes in overlay projection layer produce no visible content

## Root Cause

### Issue 1: AMS2 imports only OpenVR (not OpenXR)
AMS2AVX.exe contains `VR_Init`, `VR_Shutdown`, etc. — zero OpenXR function references. Game has no native OpenXR support. The only supported VR backends are Oculus SDK, OpenVR/SteamVR, and StarVR.

### Issue 2: OpenComposite bridges OpenVR→OpenXR
SteamVR v2.16.7 ships OpenComposite as its `openvr_api.dll` (2,447,872 bytes, built from `C:\projects\openovr\OCOVR\`). OpenComposite:
- Intercepts game's OpenVR calls → translates to OpenXR
- **Statically links the Khronos OpenXR-SDK loader** (does NOT use system `openxr_loader.dll`)
- `opencomposite.ini` has `initUsingVulkan=false` (forces D3D11 path)
- Loads API layers from `openxr/api_layers/implicit.d/` (relative CWD) and registry `ApiLayers\Implicit`

### Issue 3: Layer loading required registry value=0
The Khronos loader on Windows interprets registry DWORD:
- **0 = enabled** (load implicit layer)
- **non-zero = disabled** (skip layer)

After setting both HKLM explicit and implicit paths to 0, OpenComposite reports "Num layers available: 2"

### Issue 4: 3D overlay markers fail through OpenComposite's D3D11 device
OpenXR-MC uses two overlay mechanisms:
- **Quad layer → crosshair** — rendered into game swapchain. WORKS.
- **Projection layer → 3D marker meshes** — rendered into separate D3D11 textures. BROKEN.

The projection layer is created, textures allocated, and submitted every frame — but D3D11 rendering into those textures produces only cleared (pink) content. This is an OpenComposite limitation or bug in its D3D11 compositor implementation.

### Attempted Fix: Proxy DLL (failed)
- Built forwarder DLL with `#pragma comment(linker, "/EXPORT:...")` — all exports forwarded to `opencomposite_real.dll`. Crashed in `LoadLibraryA` from `DllMain` (unsafe).
- Built actual proxy DLL with lazy `LoadLibrary` for `openxr_loader.dll` + `d3dcompiler_47.dll` + `opencomposite_real.dll` — all 27 functions wrappers. Game launched in flatscreen (no VR) because lazy loading broke OpenComposite's state machine (`VR_IsHmdPresent` called before `VR_Init` returned false).
- **Conclusion:** Proxy DLL approach unworkable — OpenComposite uses a statically-linked loader, and initialization ordering is too fragile.

### Attempted: MSVC build tools discovered
Found at `C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools\` — can compile C++ but proxy approach abandoned due to initialization issues.

### Checked: No native OpenXR launch options
Searched AMS2 executables and config files — no `-openxr`, `-openvr`, `-oculus` command-line switches. No `openxrsettings.xml` or similar config exists. The three VR backends are selected via config file presence at startup.

## What Works for Calibration
- **Ctrl+Up/Down** — adjust offset forward/back
- **Ctrl+Right/Left** — adjust offset right/left
- **Ctrl+PgUp/PgDn** — adjust offset up/down
- **Ctrl+,/.** — rotate yaw left/right
- **Ctrl+Shift+S** — save global config
- **Ctrl+Shift+A** — save per-app config
- **Ctrl+Del** — calibrate neutral pose
- **Ctrl+Ins** — toggle MC on/off
- **Ctrl+X** — toggle crosshair overlay visibility

## Pipeline
```
AMS2 (launched from Steam)
  → openvr_api.dll (OpenComposite, 2.4MB in game folder)
    → OpenComposite translates OpenVR calls → OpenXR
      → OpenXR-MC API layer intercepts xrCreateInstance
        → 10-second countdown + audio cue plays
          → Auto-activates motion compensation (testrotation=1)
            → OpenXR-MC overlay: crosshair (quad layer) ✓, arrows (projection layer) ✗
              → SteamVR OpenXR runtime
                → SteamVR compositor + Oculus driver
                  → Meta Quest 3
```

## Key Files

| File | Location |
|------|----------|
| OpenComposite DLL (game folder) | `C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2\x64\openvr_api.dll` |
| OpenComposite backup | `C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2\x64\opencomposite_real.dll` |
| OpenComposite config | `C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2\x64\opencomposite.ini` |
| OpenXR-MC DLL | `C:\Program Files\OpenXR-MotionCompensation\XR_APILAYER_NOVENDOR_motion_compensation.dll` |
| OpenXR-MC manifest | `C:\Program Files\OpenXR-MotionCompensation\XR_APILAYER_NOVENDOR_motion_compensation.json` |
| OpenXR-MC global config | `%LOCALAPPDATA%\OpenXR-MotionCompensation\OpenXR-MotionCompensation.ini` |
| OpenXR-MC AMS2 config | `%LOCALAPPDATA%\OpenXR-MotionCompensation\Automobilista 2.ini` |
| OpenXR-MC verbose log | `%LOCALAPPDATA%\OpenXR-MotionCompensation\OpenXR-MotionCompensation.log` |
| Native OpenXR loader (unused) | `C:\Program Files (x86)\Steam\steamapps\common\Automobilista 2\x64\openxr_loader.dll` |
| AMS2 VR config | `%USERPROFILE%\Documents\Automobilista 2\graphicsconfigopenvrdx11.xml` |
| OVRMC settings (disabled) | `%APPDATA%\OVRMC\OpenVRMotionCompensation.ini` |
| SteamVR config (OVRMC off) | `C:\Program Files (x86)\Steam\config\steamvr.vrsettings` |
| MSVC build tools | `C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools\VC\Tools\MSVC\14.51.36231\bin\Hostx64\x64\cl.exe` |

## OpenXR Loading: Registry Keys
- `HKLM\SOFTWARE\Khronos\OpenXR\1\ApiLayers\Implicit\C:\Program Files\OpenXR-MotionCompensation\XR_APILAYER_NOVENDOR_motion_compensation.json` = **(DWORD) 0**
- `HKLM\SOFTWARE\Khronos\OpenXR\1\ApiLayers\Explicit\C:\Program Files\OpenXR-MotionCompensation\XR_APILAYER_NOVENDOR_motion_compensation.json` = **(DWORD) 0**
- **Note:** DWORD `0` = enabled, non-zero = disabled (opposite of typical boolean convention)

## Why Proxy DLL Failed
1. OpenComposite statically links the Khronos loader — no way to force it to use system `openxr_loader.dll`
2. `LoadLibrary` from `DllMain` causes deadlocks (loader lock violation)
3. Lazy loading in real proxy breaks OpenComposite's env-dependent state machine (`VR_IsHmdPresent` vs `VR_Init` order)
4. The D3D11 rendering issue is inside OpenComposite's compositor code, not a DLL loading order problem

## Historical Sessions

### Session 2026-07-05 — Initial setup & diagnosis
- Identified dual-issue: OpenComposite blocking OVRMC + OVRMC/OpenXR-MC double compensation
- Disabled OVRMC driver, removed OpenComposite, believed AMS2 used native OpenXR (incorrect, later disproven)
- Discovered AMS2AVX.exe uses OpenVR only (not OpenXR)
- Discovered SteamVR v2.16.7 ships OpenComposite built-in
- Fixed OpenComposite API layer loading: registry value=0 enables layers (not 1)
- Created API layer manifest copies in CWD and set `XR_API_LAYER_PATH` env var

### Session 2026-07-06 — Debugging overlay rendering, proxy DLL attempts
- Confirmed OpenXR-MC loads: audio countdown, crosshair visible, projection layer created
- Pink passthrough = projection layer submitted but no rendered content (cleared textures)
- Discovered MSVC build tools at `C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools\`
- Built forwarder proxy DLL → crash (LoadLibrary from DllMain)
- Built real proxy DLL with all 27 exports → flatscreen (init order broken)
- Restored original OpenComposite DLL
- Confirmed no native OpenXR support in AMS2 via binary analysis
- Confirmed no `-openxr` or similar launch options exist
- **Conclusion:** 3D overlay arrows not feasible through OpenComposite's D3D11 path

---

### Session 2026-07-09 — SimMapper Mapping UX Rework + Window Controls

**What was built:**

| Component | Files | Status |
|-----------|-------|--------|
| **ProfileEditorView.xaml** | Complete two-panel mapping UI — categorized action list (Driving/CarControls/View/Electronics/Menu), search, category filter buttons, action rows with binding/status, right detail panel with Capture/Clear, learn mode overlay, conflict overlay, confirmation toast | ✅ |
| **ProfileEditorView.xaml.cs** | Esc key handling during learn mode — calls `CancelCaptureCommand` | ✅ |
| **ProfileEditorViewModel.cs** | Added `ClearCategoryCommand`, `HasCaptureError`, `CaptureInput(source, deviceName)` signature | ✅ |
| **MainWindow.xaml** | Replaced default title bar with custom `WindowChrome` — minimize/maximize/close buttons, custom title bar with drag & double-click maximize | ✅ |
| **MainWindow.xaml.cs** | `MinimizeButton_Click`, `MaximizeButton_Click`, `CloseButton_Click`, `TitleBar_MouseDown` (double-click maximize), `UpdateMaximizeButton()` | ✅ |
| **InverseBoolConverter.cs** | Created for visibility toggles in ProfileEditorView | ✅ |
| **App.xaml** | Added `InverseBoolConverter` resource | ✅ |

**Design decisions:**
- `WindowChrome` with `WindowStyle="None"` preserves native resize/snap while allowing custom title bar
- Window buttons use `WindowChrome.IsHitTestVisibleInChrome="True"` so they work in the caption area
- Close button turns red (#E81123) on hover, matching Windows 11 conventions
- Title bar double-click toggles maximize/restore
- Category filter "All" button uses `ClearCategoryCommand` (sets `SelectedCategory = null`)
- `CaptureError` binds via `HasCaptureError` + `BoolToVis` (avoids needing a NullToVisibility converter)
- Esc key handled via `PreviewKeyDown` event (not command binding) for quick, reliable cancellation

**Build result:** 0 errors, 1 warning (pre-existing `MockDeviceDetector.DevicesChanged` unused), 21/21 tests passing

---

### Session 2026-07-09 — SimMapper MVP Build

**New project: SimMapper** — A Windows desktop app for sim racers to map physical controller inputs to logical racing actions, with game detection and profile auto-switching.

**Stack:** C# WPF (.NET 8) with SharpDX.DirectInput, Microsoft.Extensions.Hosting (DI), Newtonsoft.Json storage

**Build result:** 0 errors, 2 warnings (unused mock event), 21/21 tests passing

**What was built (full MVP):**

| Layer | Files | Status |
|-------|-------|--------|
| **Models** | `Device`, `PhysicalInputSource`, `LogicalAction`, `Mapping`, `CombinedDeviceProfile`, `GameProfile`, `VirtualOutput`, `PhysicalInputEvent` | ✅ |
| **Device detection** | `IDeviceDetector` + `DeviceDetector` (SharpDX DI enumeration, GUID, name, button/axis/hat counts) | ✅ Real |
| **Input listener** | `IInputListener` + `InputListener` (60Hz polling, button/axis/hat state tracking) | ✅ Real |
| **Input translation** | `IInputTranslator` + `InputTranslator` + `DigitalToAnalogueConverter` (instant/ramp/fixed modes, axis deadzone/invert) | ✅ Real |
| **Profile manager** | `IProfileManager` + `ProfileManager` (full CRUD, auto-match engine) | ✅ Real |
| **Game detection** | `IGameDetector` + `GameDetector` (process polling, 13 known games) | ✅ Real |
| **Virtual output** | `IVirtualOutput` + `VirtualOutputLogger` (debug console log) | ✅ Mocked |
| **Storage** | `IStorageService` + `JsonStorageService` (`%APPDATA%/SimMapper/`) | ✅ Real |
| **UI** | `MainWindow` + `DeviceListView` + `ProfileEditorView` + `TestModeView` + `SettingsView` | ✅ Real |
| **DI wiring** | `App.xaml.cs` — `IHost` + all singletons/transients | ✅ Real |
| **Unit tests** | 21 tests covering converter modes, translator, device matcher | ✅ 21/21 |

**File structure:**
```
SimMapper/
├── SimMapper.sln
├── src/
│   ├── SimMapper/              # WPF app
│   │   ├── App.xaml/.cs         # DI host setup
│   │   ├── MainWindow.xaml/.cs  # Tab navigation shell
│   │   ├── Models/              # 8 model classes
│   │   ├── Services/            # 7 service layers
│   │   ├── ViewModels/          # 5 ViewModels
│   │   ├── Views/               # 4 XAML views
│   │   ├── Converters/          # 3 IValueConverters
│   │   └── Helpers/             # RelayCommand, ViewModelBase, DeviceMatcher
│   └── SimMapper.Tests/         # 3 test files, 21 tests
└── data/profiles/               # JSON output directory
```

**Key design decisions:**
- `CombinedDeviceProfile` holds `DeviceIds` (list) + `Mappings` — one profile can span wheel + handbrake + shifter
- `LogicalAction` is device-independent; any physical input on any device can map to any action
- `DigitalToAnalogueMode` enum with Instant/Ramp/FixedValue for button-to-analogue conversion
- `ProfileAutoSwitcher` matches by device ID subset + game process name, picks most specific profile
- `IVirtualOutput` is logged only (no vJoy/ViGEm driver loaded yet in MVP)
- SharpDX `DeviceInstance` does not expose VID/PID directly at the enumeration level — set to 0 for MVP, can be enriched later via `Joystick.Properties`

**Next steps:**
1. Test on a machine with actual wheel hardware (Fanatec DD1, ClubSport Pedals)
2. Implement `VirtualOutputVJoy` for real virtual controller output
3. Add `ToastNotification` on profile auto-switch
4. Add `KeyboardHook` service for keyboard key mapping
5. Add active-page indicator in navigation sidebar

---

### Session 2026-07-09b — AAA Rework Pass

**Build result:** 0 errors, 0 warnings, **31/31 tests passing** (21 original + 10 new)

**What was fixed/added:**

| # | Issue | Fix | Files Changed |
|---|-------|-----|--------------|
| 1 | **Window controls** | Larger 46x32 hit targets, tooltips, bold symbols, verified WindowChrome settings | `MainWindow.xaml` |
| 2 | **Missing games** | Expanded to 23+ sim titles with rich metadata (SteamAppId, profile type, input style, wheel/DI/XInput support) | `KnownGames.cs`, `GameInfo.cs` (new) |
| 3 | **User-editable game DB** | `games.json` in `%APPDATA%/SimMapper/`, user-added games auto-register for detection | `JsonStorageService.cs`, `IStorageService.cs`, `GameDetectionViewModel.cs`, `App.xaml.cs` |
| 4 | **UI colour/contrast** | `Resources/Themes/DefaultTheme.xaml` with professional dark palette (near-black bg, graphite panels, electric blue accent, green/amber/red semantic colors, high-contrast text), merged globally in `App.xaml` | `DefaultTheme.xaml` (new), `App.xaml`, all view XAML files |
| 5 | **Device page icons** | Per-type Unicode icons: racecar (wheelbase), play (pedals), pause (handbrake), up-down (shifter), diamond (button box), gear (other) | `DeviceListViewModel.cs`, `DeviceListView.xaml` |
| 6 | **Fanatec DD1 as Unknown** | Extracted VID/PID from SharpDX DeviceInstance.ProductGuid bytes; Fanatec VID 0x0EB7 now correctly identifies all Fanatec devices | `DeviceDetector.cs` |
| 7 | **ClubSport Pedals regression** | Enhanced classifier: explicit ClubSport / CSL / V3 name checks on VID 0x0EB7 ensure pedals stay classified as pedals | `DeviceClassifier.cs` |
| 8 | **Duplicate Podium DD1** | `DeviceGrouper` groups devices by VID+PID+normalized name prefix; aggregates button/axis/hat counts; shows sub-device interface count | `DeviceGrouper.cs` (new), `Device.cs` (added `SubDevices`, `GroupId`, `IsPrimaryInGroup`) |
| 9 | **Attached rim selection** | `Device` model has `AttachedWheelName`, `AttachedWheelBrand`, `RimConfirmedByUser`; displayed in device card and profile editor status bar | `Device.cs`, `DeviceListView.xaml`, `ProfileEditorViewModel.cs` |
| 10 | **Mapping list does nothing** | Added `SelectActionCommand` + `MouseBinding LeftClick` on action rows → selects action → right panel updates | `ProfileEditorViewModel.cs`, `ProfileEditorView.xaml` |
| 11 | **Mapping page redesign** | 3-column layout: category nav (8 categories), action table (Action/Binding/Device/Output/Status columns), detail card (Capture/Clear/LastDetected/Conflict/Toast). Top status bar shows wheelbase/rim/pedals. | `ProfileEditorView.xaml` (full rewrite), `ProfileEditorViewModel.cs` |
| 12 | **Missing actions** | Added 13 new actions: Gear Up/Down, Clutch, Look Back, Look Around, Pit Radio, Request Box, Rain Lights, Menu Up/Down/Left/Right, Request Tow, Pit Exit, Neutral. Re-categorized into 9 groups: Driving, Shifting, Brakes/Handbrake, CarControls, Electronics, View, PitRadio, Menu, Misc | `LogicalAction.cs` |
| 13 | **CSS-level styling** | Theme resource dictionary with named brushes; primary/secondary/danger button styles; textbox style with hover/focus states; card/panel border styles | `DefaultTheme.xaml` (new), `App.xaml` |
| 14 | **Test coverage** | 10 new tests: DD1→Wheelbase, ClubSport→Pedals, CSL Pedals→Pedals, Moza R9→Wheelbase, Simucube→Wheelbase, Handbrake→Handbrake, Shifter→Shifter, DD1 duplicate grouping, unique device passthrough, empty group | `DeviceClassifierTests.cs` (new) |
| 15 | **Game detection view** | Now shows both built-in + user-added games, running status, refresh button | `GameDetectionView.xaml`, `GameDetectionViewModel.cs` |

**All files modified/created this session:**
- **New files (5):** `DeviceGrouper.cs`, `GameInfo.cs`, `Resources/Themes/DefaultTheme.xaml`, `DeviceClassifierTests.cs`
- **Modified files (18):** `DeviceDetector.cs`, `DeviceClassifier.cs`, `Device.cs`, `KnownGames.cs`, `GameDetectionViewModel.cs`, `GameDetectionView.xaml`, `ProfileEditorViewModel.cs`, `ProfileEditorView.xaml`, `MainViewModel.cs`, `MainWindow.xaml`, `App.xaml`, `App.xaml.cs`, `JsonStorageService.cs`, `IStorageService.cs`, `DeviceListViewModel.cs`, `DeviceListView.xaml`, `LogicalAction.cs`, `TestModeView.xaml`

---

### Session 2026-07-09c — Window Controls Binding Rework (Final Polish)

**Build result:** 0 errors, 2 warnings (pre-existing `MockDeviceDetector.DevicesChanged`), **31/31 tests passing**

**What was changed:**

| # | Change | Why | Files |
|---|--------|-----|-------|
| 1 | **Native Windows titlebar** | Custom WindowChrome had invisible buttons due to low contrast (2.8:1). Native titlebar provides reliable Close/Minimize/Maximize, Aero Snap, drag, and right-click menu. | `MainWindow.xaml`, `MainWindow.xaml.cs` |
| 2 | **Steering wheel Path icon** in nav sidebar | Replaced 🏎 emoji with proper Path geometry (circle rim + cross spokes + hub) | `MainWindow.xaml` |
| 3 | **Steering wheel Path icon** in device cards | Replaced 🏎 emoji with themed Path-based steering wheel for Wheelbase/WheelRim types; other types use text symbols | `DeviceListView.xaml`, `DeviceListViewModel.cs` |
| 4 | **Auto-capture on row click** | `SelectActionCommand` calls `StartCapture()` automatically after setting selection — no separate button press needed | `ProfileEditorViewModel.cs:117` |
| 5 | **Remove Capture Input button** | Removed from right detail panel; replaced with instructional text "Click any action row to start binding" and "Capturing input..." | `ProfileEditorView.xaml:399-413` |
| 6 | **Physical input events → diagnostics** | Collapsed behind "▶ Show Diagnostics" toggle by default in Test Mode | `TestModeView.xaml` |
| 7 | **High-contrast theme update** | Darker base (#0A0C10), brighter cards (#1A1D24), stronger borders (#2D323C), refined accent (#4A9EFF), added `ListeningBgBrush` | `DefaultTheme.xaml` |
| 8 | **Dead code removal** | `CaptureInputCommand` property removed from ViewModel (no longer bound in XAML) | `ProfileEditorViewModel.cs` |

**Next Steps:**
1. Visual verification: native titlebar controls, steering wheel icon, click-to-capture flow, no Capture Input button, diagnostics hidden by default, theme contrast
2. Test on a machine with actual wheel hardware (Fanatec DD1, ClubSport Pedals)
3. Implement `VirtualOutputVJoy` for real virtual controller output
4. Add `ToastNotification` on profile auto-switch
5. Add `KeyboardHook` service for keyboard key mapping

---

### Session 2026-07-10 — Current Mappings Panel + Binding/Unbinding Interaction Rework

**Build result:** 0 errors, 0 warnings, **31/31 tests passing**

**What was changed:**

| # | Change | Why | Files |
|---|--------|-----|-------|
| 1 | **Right panel redesign** | Replaced cluttered "Control Assignment" panel with clean "Current Mappings" panel showing only bound actions sorted by category, with mapped count, progress bar, and empty state | `CockpitProfileView.xaml:311-425` (rewrite) |
| 2 | **MappedBindingItems** | New `ObservableCollection<ActionBindingItem>` — only bound items, sorted by category/action order, rebuilt on every mapping change | `CockpitProfileViewModel.cs:38` |
| 3 | **Current Mappings properties** | `MappedCountDisplay`, `ProgressBarWidth`, `HasMappedBindings`, `ClearBindingButtonText`, `IsMappedActionSelected` | `CockpitProfileViewModel.cs:74-81` |
| 4 | **Unbind mode** | New `IsUnbindMode` bool + `ShowBindingDetails()` — shows overlay with current binding + Unbind/Cancel buttons for bound actions | `CockpitProfileViewModel.cs` (new methods) |
| 5 | **UnbindCommand** | Removes mapping, closes overlay, shows confirmation, auto-saves | `CockpitProfileViewModel.cs` |
| 6 | **ClearAllMappingsCommand** | Clears all with Yes/No confirmation dialog | `CockpitProfileViewModel.cs` |
| 7 | **SelectActionCommand** | Now conditional: bound → `ShowBindingDetails()`, unbound → `StartCapture()` | `CockpitProfileViewModel.cs:137-143` |
| 8 | **Click mapping → jump to action** | `SelectMappingItem()` + `RequestScrollToAction` event + code-behind `CurrentMappingRow_MouseLeftButtonUp` + `FindVisualChild` scroll-into-view | `CockpitProfileViewModel.cs`, `CockpitProfileView.xaml.cs` |
| 9 | **CompleteCapture rebind fix** | Removes existing mapping for same `LogicalActionId` before adding new one (supports rebind) | `CockpitProfileViewModel.cs:336-341` |
| 10 | **Learn overlay unbind UI** | Two-mode overlay: capture mode (pulsing dot, instructions) and unbind mode (current binding card, Unbind/Cancel buttons) | `CockpitProfileView.xaml:464-547` |
| 11 | **Overlay escape handling** | CancelCaptureCommand resets `IsUnbindMode`, Escape/Cancel leave original binding unchanged | `CockpitProfileViewModel.cs:443` |

**Key design decisions:**
- Mapped bindings sorted by ActionCategory enum order (Motion→Vehicle→Camera→Assistance→Gameplay) then by `_allActionBindings` insertion order
- Old binding is NOT erased when capture overlay opens — only changed on Unbind click or new input capture
- `SelectMappingItem()` is separate from `SelectActionCommand` — it switches category + selects row without entering capture
- `ClearAllMappings` requires confirmation via `MessageBox.Show(YesNo)`
- Progress bar uses `ProgressBarWidth` property (CompletenessPercent × 2.48) bound directly to inner Border width
- Empty state shows "No controls mapped yet. Select an action row to begin." when no mappings exist
- Clicking a mapping in Current Mappings jumps to the corresponding category tab + action row with highlight

---

### Session 2026-07-19 — Revolut Group Commitment Product Concept Package

**User direction:** Ignore prior project context for the work product and focus only on the provided master prompt for a 90-second premium Revolut concept video.

**What was created:**

| File | Purpose |
|------|---------|
| `Revolut_GroupCommitment_ProductionPackage.md` | Complete production package for the 90-second Group Commitment concept video, including screenplay, voiceover, storyboard, image prompts, motion prompts, music prompts, SFX, editing guide, production plan, and compliance checklist |
| `Subtitles.srt` | Standalone SRT subtitle file timed to the 90-second voiceover |

**Key creative constraints captured:**
- Revolut is not mentioned until Scene 4.
- Everything happens through phone screens.
- Same iPhone 15 Pro with Dynamic Island, same angle, same lighting throughout.
- WhatsApp-style messaging UI is unbranded.
- No people physically together, no physical locations, no cafes, kitchens, restaurants, bars, holidays, airports, beaches, or cinematic b-roll.
- Scene 3 silence is preserved as the emotional beat.

**Next Steps:**
1. Review `Revolut_GroupCommitment_ProductionPackage.md` for wording and timing.
2. Use `Subtitles.srt` when assembling the 90-second edit.
3. If producing the actual video, build the static phone UI frames first, then animate according to the motion prompts.

---

### Session 2026-07-20 — Group Commitment Final Video Export

**User request:** Turn the completed Group Commitment concept package into finished, fully viewable, distribution-ready video deliverables.

**Inspection findings:**
- The root Vite/Electron project is unrelated (`elementary` chemistry simulator).
- No completed Revolut video, image, narration, music, SFX, After Effects, Remotion, or render project assets were present.
- Existing relevant inputs were `Revolut_GroupCommitment_ProductionPackage.md` and `Subtitles.srt`.

**Backup created:**
- `backup_group_commitment_before_render_20260720/` containing the pre-render production package and subtitle file.

**Render tooling added:**

| File | Purpose |
|------|---------|
| `render_group_commitment/generate_voice.ps1` | Generates per-line en-GB narration WAV clips using local Windows Speech (`Microsoft Hazel Desktop` when available) |
| `render_group_commitment/render_group_commitment.py` | Reproducible render pipeline: creates audio mix, phone-interface animation, subtitles, thumbnail, final MP4 encodes, FFprobe validation, and report |

**Dependencies installed/used:**
- User-local FFmpeg 8.1.2 essentials downloaded to `C:\Users\a6lit\AppData\Local\Temp\opencode\ffmpeg\ffmpeg-8.1.2-essentials_build\` because system FFmpeg was unavailable and Chocolatey lacked elevation.
- Pillow 12.3.0 installed for Python 3.14 with `python -m pip install --user pillow`.

**Final deliverables created in `final_exports/`:**

| File | Result |
|------|--------|
| `Revolut_Group_Commitment_Concept_4K.mp4` | 3840x2160, 30fps, H.264, yuv420p, AAC 48kHz 320kbps, fast-start enabled |
| `Revolut_Group_Commitment_Concept_1080p.mp4` | 1920x1080, 30fps, H.264, yuv420p, AAC 48kHz 320kbps, fast-start enabled |
| `Revolut_Group_Commitment_Review_Timecode.mp4` | 1920x1080 review copy with visible lower-right timecode |
| `Revolut_Group_Commitment_Subtitles.srt` | Separate SRT, British English, max two lines |
| `Revolut_Group_Commitment_Thumbnail.png` | 1920x1080 thumbnail with required title/subtitle |
| `RENDER_REPORT.md` | FFprobe metadata, decode validation, asset notes, limitations, and exact rerender command |

**Validation result:**
- All three MP4s decoded end-to-end with FFmpeg.
- FFprobe confirms expected resolution, duration (~90.005s), 30fps, H.264, yuv420p, AAC, 48kHz, 320000 bps audio.
- Fast-start verified true for all MP4 files.
- Thumbnail verified as 1920x1080.

**Known limitation:**
- Because no pre-recorded narration or finished media assets existed in the workspace, the final playable video recreates narration, music, SFX, and phone-interface visuals locally from the approved production package rather than using pre-existing clips/assets.

**Exact rerender command:**
```powershell
python "C:\Users\a6lit\OneDrive\Documents\New folder\render_group_commitment\render_group_commitment.py"
```

---

### Session 2026-07-21 — Quest 3 Link Cable Dropout Diagnosis

**User request:** Quest headset repeatedly exited Link/cable VR after roughly 60-90 seconds and asked to unplug/replug the Link cable.

**Diagnosis findings:**
- Oculus runtime log `C:\Users\a6lit\AppData\Local\Oculus\Service_2026-07-21_20.57.51.txt` showed the root cause directly:
  - `ovrError_XRStreamingUSBIssue`
  - `WinUsb_ReadPipe(...) failed`
  - `oculus_pc_xrs_participant_did_terminate transmission_type: USB3 is_usb_still_attached: true termination_reason: device_error`
  - `HMD 2G0YC1ZG1T057N got health event with error code -4503: Flaky cable`
  - Quest USB device disappeared from Oculus' available device list, then reappeared about one second later.
- Windows showed the headset as connected through Reality Labs USB interfaces (`VID_2833&PID_5010`) at USB SuperSpeed.
- Oculus Link bitrate had been forced to `500 Mbps` in `HKCU\Software\Oculus\RemoteHeadset\BitrateMbps`, which increases sensitivity to marginal USB/cable behavior.
- Windows logged `Virtual Memory Minimum Too Low`, and Oculus/OpenXR client logs showed `VirtualLock failed ... 1453`; page file was only 2 GB. This is a secondary stability issue, not the primary Link cable disconnect cause.

**Changes applied:**
- Disabled USB selective suspend for the active High Performance power plan on AC and DC via `powercfg`.
- Reset Oculus Link bitrate from forced `500` to `0` (automatic/default) in `HKCU\Software\Oculus\RemoteHeadset\BitrateMbps`.
- Restarted the Oculus runtime by terminating `OVRServer_x64`; `OVRService` immediately relaunched it.
- Verified new runtime log `Service_2026-07-21_21.04.44.txt` loaded `BitrateMbps: uint32: 0 (0)`.

**Blocked / requires elevation:**
- Direct device power-management registry writes under `HKLM\SYSTEM\CurrentControlSet\Enum\...` were blocked by Windows access control.
- Service restart via `Restart-Service OVRService` was blocked without elevation, but process restart worked.
- Page file sizing could not be changed without admin rights. `AutomaticManagedPagefile` reports true, but current page file allocation remains 2 GB until Windows/admin settings change it.

**Current conclusion:**
- Primary root cause is a USB physical/transport dropout, reported by Meta as `Flaky cable`. The PC-side mitigations that do not require admin have been applied. If it still drops, the next fix is hardware path isolation: plug directly into a rear motherboard USB 3.x port with no hub/front-panel/extension, use another known-good high-quality Link cable, and secure cable strain relief at the headset.

**Next Steps:**
1. Test Link again for at least 3-5 minutes after the bitrate reset and USB selective-suspend change.
2. If it still drops, move the cable to a rear motherboard USB 3.x port and avoid all hubs/front-panel ports/extensions.
3. If it still drops on a rear port, replace the cable; logs explicitly reported `Flaky cable`.
4. Optional admin fix: run elevated to set a larger page file and disable per-device USB idle power flags for Quest/root hub entries.

---

### Session 2026-07-27 — Analog Headset Microphone / Voice Typing Diagnosis

**User request:** Get the microphone working on gaming headphones plugged into the aux jack for desktop talk-to-text / voice typing.

**Diagnosis findings:**
- Windows detected only one active recording endpoint: `Headset Microphone (Oculus Virtual Audio Device)`.
- The analog headset was detected only as an output endpoint: `Gaming Headphones (Realtek USB2.0 Audio)`.
- No active Realtek/analog headset microphone endpoint was present through the aux jack.
- Microphone privacy access was already allowed at both HKCU and HKLM consent-store levels.
- Opened Windows Sound settings and Microphone privacy settings for user-side confirmation.

**Current conclusion:**
- The issue is most likely physical jack/cable compatibility or Realtek jack retasking, not Windows dictation permissions.
- A desktop headphone/aux jack usually carries audio output only. A headset microphone needs a pink mic jack, a true combo headset jack, a CTIA TRRS-to-dual-TRS splitter, or a USB headset adapter.

**Next Steps:**
1. If the headset has one 3.5mm plug with three black rings, use a CTIA headset splitter: single female TRRS to separate green headphone + pink microphone plugs.
2. Plug the pink mic lead into the PC microphone input, not blue line-in or green headphone-out.
3. If using a true combo headset jack, choose `Headset` or `Mic In` in the Realtek popup / Realtek Audio Console, not `Headphones`.
4. In Windows Settings → System → Sound → Input, select the newly detected Realtek microphone and test the input meter.
5. Use `Win + H` in any text field to start Windows voice typing once the input meter moves.

---

### Session 2026-07-29 — LG TV HDMI Audio Diagnosis

**User request:** Diagnose no sound from TV speakers when using the PC over HDMI. Windows Sound settings showed the TV selected and green playback bars moving, while the TV's own tuner/TV mode had working speaker audio.

**Diagnosis findings:**
- Windows detects the active HDMI audio endpoint as `Big TV (NVIDIA High Definition Audio)`.
- `Big TV` is the default render endpoint for Console and Multimedia roles.
- `Big TV` is active, unmuted, volume 100%, and CoreAudio reported live output meter movement (`PeakNow` around 7.8%).
- NVIDIA High Definition Audio driver status is OK.
- Windows audio services `Audiosrv` and `AudioEndpointBuilder` are running.
- Active display is an LG HDMI display (`LG TV SSCR2`, manufacturer `GSM`) connected through HDMI (`VideoOutputTechnology: 5`).
- HDMI audio default format on the active TV endpoint is safe/stereo PCM: 2 channels, 48 kHz, 16-bit (`WAVEFORMATEXTENSIBLE`, offset 8 in the registry property blob).
- A generated 3-second 440 Hz test tone was played through the current Windows default output; user confirmed no sound came from the TV speakers.
- Attempts to reset the Windows audio engine/services without elevation were blocked by access control:
  - `Stop-Process audiodg -Force` denied.
  - `Restart-Service Audiosrv` and `AudioEndpointBuilder` denied.

**Current conclusion:**
- Windows-side routing, mute/volume, and audio format appear correct. Windows is actively delivering stereo PCM to the LG/Big TV HDMI endpoint.
- The most likely failure point is after Windows hands audio to HDMI: TV HDMI input audio routing/format, LG PC-input mode behavior, eARC/CEC/sound-output routing, HDMI handshake, cable/port, or NVIDIA HDMI audio driver/endpoint state requiring an elevated reset.

**Next Steps:**
1. On the LG TV while on the PC HDMI input, set Sound Out to `TV Speaker` / internal speaker, not HDMI ARC/eARC, optical, Bluetooth, or external audio system.
2. On the LG TV, set the current HDMI input's audio format to `PCM`; also set Digital Sound Output to `PCM` for testing.
3. Temporarily disable eARC and Simplink/HDMI-CEC on the TV, then test PC audio again.
4. If the HDMI input is labelled/iconed as `PC`, test changing that input label/icon to generic `HDMI` or `Game Console`, then switch back if needed.
5. Force a clean HDMI handshake: turn TV off, unplug TV power for 60 seconds, unplug/replug HDMI at both ends, then power the TV back on and select the PC HDMI input.
6. Test a different HDMI port on the LG TV and a different known-good HDMI cable, with the PC connected directly to the TV and no receiver/capture card/adapter in between.
7. If still silent, run elevated/admin reset of the NVIDIA HDMI audio device: disable/enable `NVIDIA High Definition Audio` in Device Manager, or restart the device with `pnputil` from an elevated terminal, then reboot if needed.
8. If the problem survives TV settings, handshake, port, cable, and elevated NVIDIA HDMI-audio reset, reinstall the NVIDIA driver including the HD Audio component.

**Follow-up actions in same session:**
- Confirmed current terminal was not elevated (`IsAdministrator: False`).
- Identified NVIDIA HDMI audio device instance: `HDAUDIO\FUNC_01&VEN_10DE&DEV_00A4&SUBSYS_14625111&REV_1001\5&2F81DD3D&0&0001`.
- Non-elevated `pnputil /restart-device` failed with `Access is denied`.
- Launched elevated PowerShell via UAC to run `pnputil /restart-device` on the NVIDIA HDMI audio device.
- Elevated restart succeeded, but returned `ExitCode=3010` with message `System reboot is needed to complete configuration operations!`.
- Rechecked device state after restart attempt: `NVIDIA High Definition Audio` and `Big TV (NVIDIA High Definition Audio)` both still reported OK.
- Replayed the generated 3-second test tone after the elevated restart; user confirmed still no TV sound.
- User approved reboot to complete the NVIDIA HDMI-audio restart.

**Post-reboot follow-up:**
- User reported TV HDMI audio was still silent after reboot.
- Rechecked post-reboot state: `NVIDIA High Definition Audio` OK, `Big TV (NVIDIA High Definition Audio)` OK, LG display still active as `LG TV SSCR2`, Windows audio services running.
- Confirmed `Big TV` remained default for Console and Multimedia roles, unmuted, volume 100%.
- Set all Windows default render roles, including Communications, to `Big TV`; generated test tone still silent.
- Elevated restart of Windows Audio completed; generated test tone still silent.
- Attempted to set the endpoint `PKEY_AudioEndpoint_Disable_SysFx` flag for `Big TV`, but Windows protected the MMDevices registry key and denied the write even elevated.
- Played a 90-second repeating tone for live LG settings checks; user reported still silent.
- Confirmed PC is connected direct HDMI from RTX 4080 to LG TV, no adapter/receiver/splitter.
- Checked NVIDIA HDMI audio and LG monitor PnP properties: both `ProblemCode = 0`, `HasProblem = False`.
- Tried moving HDMI to another LG HDMI port; TV showed `No signal`. Windows still believed LG display/audio were active.
- Temporarily switched output from `3840x2160@60` to `1920x1080@60` to test whether the alternate TV port rejected 4K60; TV still showed `No signal` on that port.
- Moved cable back to the original LG HDMI port; picture returned. Test tone at 1080p60 on original port was still silent.
- Swapped to another HDMI cable on the original LG HDMI port; picture worked, but test tone was still silent.
- User had no other HDMI source available to test whether the same LG HDMI input plays audio from a different device.
- Found two NVIDIA HDMI audio driver packages in DriverStore:
  - Current active: `oem61.inf`, `nvhda.inf`, version `1.4.5.7`, date `12/01/2025`.
  - Older available: `oem17.inf`, `nvhda.inf`, version `1.4.3.2`, date `09/28/2024`.
- Non-destructive elevated install of the older package succeeded only as an already-present package check; Windows kept active driver `1.4.5.7` / `oem61.inf` and reported the device was up-to-date.
- A true NVIDIA HDMI audio rollback would require removing current package `oem61.inf` with `/uninstall` so Windows can fall back to `oem17.inf`; user did not approve that removal, so it was not performed.
- Restored/confirmed display output at `3840x2160@60`.

**Current conclusion after extended testing:**
- PC-side routing, audio roles, volume/mute, PCM format, services, NVIDIA HDMI audio device health, reboot, Windows Audio restart, HDMI cable, and 1080p/4K mode have all been tested without restoring sound.
- Strongest remaining suspects are LG TV HDMI input audio handling/settings, a TV firmware/input fault, or an NVIDIA HD-audio driver regression that would require approved rollback/removal of `oem61.inf` or a clean NVIDIA driver reinstall.

**Updated Next Steps:**
1. If approved, perform a true NVIDIA HDMI audio rollback by removing `oem61.inf` (`1.4.5.7`) and letting Windows fall back to `oem17.inf` (`1.4.3.2`), then reboot and retest.
2. If rollback is not approved, test any other HDMI source on the same LG HDMI input to prove whether the TV can play HDMI audio at all on that port.
3. Recheck LG TV settings on the exact PC HDMI input: `Sound Out = TV Speaker`, HDMI input audio format `PCM`, Digital Sound Output `PCM`, eARC off, Simplink/CEC off, no Bluetooth/optical/soundbar output selected.
4. If another HDMI source is also silent on that LG port, factory reset LG sound/input settings or update TV firmware.
5. If another HDMI source plays audio correctly on that LG port, perform NVIDIA HD-audio rollback or clean reinstall the NVIDIA driver including the HD Audio component.

---

### Session 2026-09-06 — CompTIA A+ Legacy Cables Timeline Infographic

**User request:** Create a premium-quality one-page landscape presentation/infographic titled `CompTIA A+ Core 1 — Legacy Cables & Connectors Timeline` for exam revision.

**Deliverables created:**

| File | Purpose |
|------|---------|
| `CompTIA_Aplus_Core1_Legacy_Cables_Timeline.svg` | Editable vector master slide, 3840x2160 landscape canvas |
| `CompTIA_Aplus_Core1_Legacy_Cables_Timeline.png` | High-resolution raster export for viewing, printing, or insertion into presentations |

**What was included:**
- Chronological timeline cards for RS-232 Serial, Parallel / Printer Port, Coaxial Ethernet, PS/2, and PATA / IDE.
- Vector-style connector drawings: DB-9, DB-25, Centronics printer connector, BNC coax with T-piece, purple/green 6-pin mini-DIN PS/2, and wide 40-pin PATA ribbon connector.
- Short exam-focused notes for key use, CompTIA memory cues, decline reason, and approximate mainstream phase-out.
- Lifespan bars labelled as approximate mainstream eras, avoiding misleading exact obsolete years.
- Summary boxes for `WHY THEY DISAPPEARED` and `COMPTIA QUICK RECOGNITION`.
- Explicit notes that DB-25 connector shape alone does not determine protocol and that coax remains used for cable broadband/RF systems.

**Validation performed:**
- Exported PNG with Microsoft Edge headless at `3840x2160`.
- Verified PNG dimensions and file integrity with Pillow: `3840x2160 RGB`, `png verify ok`.
- Parsed SVG successfully as XML.
- Checked required facts were present: RS-232 1960, parallel/Centronics 1970s, 10BASE5 thick coax early 1980s, 10BASE2 thin coax/BNC mid-1980s, PS/2 1987, PATA/IDE mid-1980s era, approximate mainstream decline labels, DB-25 serial caveat, and coax-not-obsolete caveat.

**Next Steps:**
1. Review the PNG visually for preferred print size and any wording/layout tweaks.
2. If needed, export to PDF from the SVG/PNG for print handouts.

---

### Session 2026-09-06 — CompTIA A+ Motherboard Components Poster

**User request:** Create a clean, technically accurate, beginner-friendly labelled diagram of a desktop ATX motherboard for CompTIA A+ Core 1 study.

**What was created:**

| File | Purpose |
|------|---------|
| `create_motherboard_poster.py` | Reproducible Python/Pillow renderer for the poster artwork |
| `CompTIA_APlus_Core1_Motherboard_Components.png` | Finished high-resolution printable A4 landscape poster, 3508x2480 at 300 DPI |

**Poster contents:**
- ATX-style top-down motherboard layout with realistic component placement.
- Labelled CPU socket, DIMM slots, PCIe x16, PCIe x1, SATA ports, 24-pin ATX power, 8-pin CPU/EPS power, chipset, CMOS battery, M.2 slot, CPU_FAN header, SYS_FAN header, front-panel header, USB header, front-audio header, rear I/O, and VRM area.
- Callout arrows point to the intended physical components.
- Quick Memory box added at the bottom with the requested study associations.

**Validation:**
- Generated with Python 3.14.5 and Pillow 12.3.0.
- Verified output dimensions and DPI: 3508x2480, approximately 300 DPI.

**Next Steps:**
1. Review the PNG visually before printing.
2. If desired, refine label placement or export variants such as portrait, PDF, or SVG.

---

### Session 2026-09-06 — CompTIA A+ Core 1 Cables & Connectors Poster

**User request:** Create a clean, easy-to-study A4 portrait poster/infographic titled `CompTIA A+ Core 1 — Common Cables & Connectors`, suitable for printing and CompTIA A+ Core 1 revision.

**What was created:**

| File | Purpose |
|------|---------|
| `create_comptia_cables_poster.py` | Reproducible Python/Pillow generator for the A4 poster |
| `CompTIA_A_Core1_Common_Cables_Connectors_Poster.png` | 300 DPI A4 portrait poster image, 2480x3508 pixels |
| `CompTIA_A_Core1_Common_Cables_Connectors_Poster.pdf` | Print-ready A4 portrait PDF generated from the 300 DPI poster image |

**Poster content:**
- Ethernet/RJ45 with 8-contact callout and LAN use.
- HDMI with digital video + audio use.
- USB Type-A, Type-B, Mini-USB, Micro-USB, and USB Type-C shown separately with distinct shapes.
- VGA/DE-15 with 15 pins in 3 rows and analog-video callout.
- DVI-D, DVI-A, and DVI-I with visually distinct analog blade pins and single-link vs dual-link centre-pin patterns.
- LC and SC fiber connectors, thin optical fibre, light signalling, long-distance/high-speed networking, and EMI resistance.
- 3.5 mm PC audio colour codes plus Optical TOSLINK.
- Bottom `QUICK MEMORY` box with the requested connector-to-use associations.

**Validation result:**
- PNG verified as `2480x3508` pixels with approximately `300 DPI` metadata.
- PDF generated successfully as an A4 portrait printable page.

**Next Steps:**
1. Print `CompTIA_A_Core1_Common_Cables_Connectors_Poster.pdf` using actual size / 100% scale, or fit-to-page only if the printer clips margins.
2. If edits are needed, update `create_comptia_cables_poster.py` and rerun `python create_comptia_cables_poster.py`.

---

### Session 2026-09-09 — Quest 3 Link and Air Link Failure Diagnosis

**Diagnosis findings:**
- The newest Meta runtime log `C:\Users\a6lit\AppData\Local\Oculus\Service_2026-09-09_18.18.14.txt` showed the Quest was not enumerating over USB: `failed to open device vid=2833 ... no device`, followed by `XRS Device Thread USB: Connection failed ... -1002`.
- Air Link was advertising locally, but the PC was on the `Coldblow Guest 2` Wi-Fi network with Windows `NetworkCategory=Public`; the runtime also reported `Could not get list of available networks ... 80070005 Access is denied`.
- An enabled outbound Windows Firewall rule named `Block oculus dash` blocked `OculusDash.exe`.
- During runtime repair/restart, the Meta installation was found incomplete: `C:\Program Files\Meta Horizon\Support\` and `OculusClient.exe` were missing, and no Oculus/Meta runtime processes or service remained after shutdown. The registry still referenced the installation.
- The official installer payload remained present under `C:\Program Files\Meta Horizon\Downloads\` and `Setup.exe` was available.

**Changes applied:**
- Disabled `Block oculus dash` without deleting it.
- Changed the Wi-Fi profile from `Public` to `Private` so local Air Link discovery is permitted.
- Reset/confirmed Oculus `BitrateMbps=0` (automatic) from the earlier Link-dropout repair.
- Started the official elevated `C:\Program Files\Meta Horizon\Setup.exe` repair. It is currently running as the visible `Link setup` installer window.

**Current status:**
- The installer must finish restoring Meta Horizon runtime/client files and services before USB or Air Link can be verified.
- The PC is connected only by Wi-Fi to a guest SSID; guest-network client isolation may still prevent Air Link even after software repair. A normal non-guest 5 GHz/6 GHz LAN, with the PC preferably wired to the router, is required for reliable Air Link.

**Next Steps:**
1. Complete the visible `Link setup` installer if it requests confirmation.
2. Recheck `OVRService`, `OVRServer_x64.exe`, `OculusClient.exe`, and Quest USB VID `2833` after installation.
3. Test cable Link with the headset awake and the cable directly in a rear motherboard USB 3.x port.
4. Test Air Link only while the PC and headset are on the same non-guest LAN; keep `Block oculus dash` disabled.

---

### Session 2026-09-10 — Quest Desktop/VR Mode Transition Diagnosis

**User request:** Diagnose why the Quest 3 remains in the desktop/Oculus panel state with Oculus audio audible instead of entering full VR. No fixes were to be applied yet.

**Live findings:**
- Meta runtime, `OVRService`, `OVRServer_x64`, `OculusDash`, and the restored Meta runtime components are running.
- Windows currently detects all Quest USB interfaces as `Reality Labs Composite ...` with status `OK` (`VID_2833&PID_5010`), so the headset is physically enumerated at the time of inspection.
- Meta log `C:\Users\a6lit\AppData\Local\Oculus\Service_2026-09-09_19.09.01.txt` shows the Quest proximity sensor becoming active and the headset being mounted, but the Link transport repeatedly fails to open `winusb,2833,ff,89` with `(10) no device`.
- The same log records `DML:HMDNormal ... State:NotDetected, IsDetected:0, IsReady:0, Mode:Unknown, IsWirelessReady:0` repeatedly after the transition attempt.
- Meta changes from VR rendering to `cur_activity=hmd_off` / `dash_visibility=SHOWN`; this is the observed desktop panel fallback.
- SteamVR log shows the compositor started successfully at 19:41:12, detected the Oculus HMD/controllers, then shut down at 19:41:22. SteamVR startup also recorded `VR_Init failed with Unable to connect to Oculus Runtime (1000)`.
- Brave has ordinary Windows processes only. There is no evidence that Brave is the cause; it is the desktop panel content that remains visible after the VR transport dies.
- A secondary non-fatal audio parsing error appears (`RemoteHeadphones.cpp ... OculusVadPeriodicCaptureStatsPayloadRecord`), but the decisive failure is the lost XR streaming/USB transport and resulting `NotDetected` state.

**Conclusion before repair:**
- The Quest is not stuck because of Brave. It briefly enters the VR pipeline, then the Meta Link transport loses the Quest's WinUSB XRSP interface. Oculus keeps audio/dashboard services alive, so the user hears Oculus background audio and sees the desktop panel, while SteamVR cannot maintain a full VR session.
- This is currently a Link transport/session failure, not an application-level VR launch failure. Air Link would need separate live testing; the inspected log contains no successful wireless session.

**Next Steps after user approval:**
1. Capture whether the active session is cable or Air Link, then repair the corresponding transport without changing unrelated VR/OpenXR configuration.
2. For cable Link, isolate the USB path and verify the `Reality Labs Composite XRSP Interface` remains open during the transition.
3. For Air Link, verify a successful mDNS discovery and wireless-ready state on a non-guest LAN.

---

### Session 2026-09-10 — Quest VR Transition Repair

**Repair performed:**
- Stopped stale SteamVR/Meta dashboard processes.
- Restarted the Quest 3 composite USB device with `pnputil /restart-device` for `USB\VID_2833&PID_5010\2G0YC1ZG1T057N`.
- Restarted `OVRService` elevated.
- Found the installed `OculusClient.exe` was a zero-byte stub; the real client binary was `Support\oculus-client\Client.exe`. Starting `Client.exe` as the normal logged-in user avoided the service's `OVR25027186` elevation launch failure.
- Started SteamVR normally after the Meta client/session was established.

**Verification:**
- Meta log reached `XrspSession ... Connected`, `Device ... is ready for use`, and `oculus_pc_app_state_app_first_frame`.
- Meta recorded sustained USB3 Quest 3 streaming: 3,690 PC frames, 3,606 completed frames, and `transmission_type=USB3`.
- SteamVR `vrcompositor` reached `Startup Complete`; `vrserver` recognized existing HMD `oculus.2G0YC1ZG1T057N` and created swap chains successfully.
- Current processes include `Client.exe`, `OVRServer_x64`, `OculusDash`, `vrserver`, `vrmonitor`, and `vrcompositor`.

**Result:**
- The desktop-only fallback was repaired. The failure was the stale XRSP/USB session combined with the broken zero-byte Oculus client launcher, not Brave.
- The headset must be worn/proximity-active for the final visual confirmation; the log showed a later `NotDetected` event when the headset proximity state went inactive, which is expected when it is removed.

---

### Session 2026-10-15 — Smuggle Tycoon → iOS/AAA Polish (M0 + M1)

**Project:** `angelo/` — Smuggle Tycoon (React 18 + Vite 6 + TS + Tailwind). Target: playable, native-feeling **portrait iOS** with a locked step-by-step run flow and AAA polish. Engine in `src/core/` is treated as sacred (UI/audio-only changes).

**Decisions locked:** portrait only; realtime clock off; Day = per-run counter; quantity planned at home, confirmed/adjustable at dealer; remove Journal + Activity log entirely; remove all music/ambience (SFX only); App Store not required.

#### Milestone 0 — Pre-Modification Baseline (safety)
- Repo is `smuggle-tycoon` (`origin …/BasilStillborn/smuggle-tycoon.git`), branch `master`. **`angelo/` was entirely untracked** in a mixed workspace, so the mandate's `git add .` was rejected as contaminating; staged `angelo/` only.
- **Found the baseline was NOT build-green:** `tsc -b` failed with 6 pre-existing type errors (tests passed 38/38 because vitest uses esbuild, no type-check).
- History-preserving sequence: as-found snapshot committed on `master` (`395a2ac`) → branch `feature/ios-aaa-polish` → minimal fixes → tag **`v0.9.0-pre-polish`** on the green commit `ceed826`.
- Fixes: `addGood(player, goodId, qty, costPerUnit=0)` in `inventory.ts`; added `stashCapacity`/`inventoryCapacity` to `SafehouseLevel` + all 5 tiers in `SafehouseState.tsx`; deleted dead unreferenced barrel `src/ui/index.ts`.
- Physical backup: `angelo-backup-20261015.zip` (84 entries, 0.26 MB) at workspace root — **still to be uploaded to two locations**.

#### Milestone 1 — Flow Scaffold + Hub + audio (built, build+test green: 0 errors, 38/38 tests)
- **Flow scaffold:** `src/ui/flow/steps.ts` (screen resolver + run-step index), `src/ui/flow/useGameFlow.ts` (reducer + localStorage `angelo_save` debounce + audio/haptic reactions + `send`/`press` helpers), `src/ui/flow/GameShell.tsx` (mounted from `MobileEntry`, replaces `MobileGameScreen`).
- **Hub:** `screens/HubScreen.tsx` (hero, withdraw-and-start CTA, Bank/Safehouse/Assets entry), `components/HubStatBar.tsx` (Cash·Bank·Worth·Day), `components/HubInfoWindow.tsx` (scene/safehouse/heat/holdings/trips), `components/HubSheets.tsx` (Safehouse + Assets sheets).
- **Run windows (basic playable loop):** `screens/PlanScreen.tsx` (product + destination/class → `CONFIRM_FLIGHT`), `screens/StashSellScreen.tsx` (stash/retrieve + kingpin contact + end run), `screens/RunScreen.tsx` (in-transit fallback), `components/SceneCard.tsx` (full-screen event renderer, replaced `EventModal` incl. custom-quantity flow).
- **Audio:** new `audio/haptics.ts` (Capacitor-aware, no-op in browser); curated palette added to `sfx.ts` (`processing`, `money`, `warning`, `danger`, `reveal`); `AudioManager.ts` rewritten with ambience removed; deleted `audio/ambience.ts`; removed `createContinuousOscillator`/`createLFO` from `oscillator.ts`; dropped `ambienceVolume` from `audio/types.ts`.
- **Cuts:** deleted `MobileApp`, `ItemDetailModal`, `ListingForm`, `MobileGameScreen`, `BottomNav`, `JournalScreen`, `EventModal`, `DashboardPanel`, `MarketPanel`, `TravelPanel`, `SafehousePanel`, `KingpinsPanel`, `pages/*`, `hooks/useApi.ts`.
- **CSS:** appended the full flow/hub/scene/sheet stylesheet to `src/index.css` (stat bar, hub, infowindow, full-screen scene card, quantity stepper, plan/stash/run, bottom sheets, `touch-action: manipulation`).
- **New UI dispatch coverage:** Hub withdraw (START_TRIP) · product/destination (SELECT_PRODUCT, CONFIRM_FLIGHT) · all events (RESPOND_EVENT via SceneCard) · stash/retrieve (STASH_GOODS, RETRIEVE_GOODS) · kingpin (CONTACT_KINGPIN) · end run (END_TRIP) · bank/assets sheets (transfers, BUY_ASSET/SELL_ASSET).

#### Files
- **New:** `ui/flow/{steps.ts,useGameFlow.ts,GameShell.tsx}`, `ui/screens/{HubScreen,PlanScreen,StashSellScreen,RunScreen}.tsx`, `ui/components/{HubStatBar,HubInfoWindow,HubSheets,SceneCard}.tsx`, `audio/haptics.ts`.
- **Modified:** `ui/components/MobileEntry.tsx`, `audio/{AudioManager.ts,sfx.ts,oscillator.ts,types.ts}`, `index.css`, `core/{inventory.ts}`, `ui/visual/SafehouseState.tsx`.
- **Deleted:** `audio/ambience.ts`, `ui/index.ts`, and the dead component/page tree listed above.

#### Next Steps
1. **Commit M1** on `feature/ios-aaa-polish` (awaiting user go-ahead) + push.
2. **M2 — polish the run:** dedicated Flight/customs transition interstitials (`RunTransition`), premium restyle of Plan/Stash with scenario art, verify post-buy → airport handoff and `arrival_` vs `AFTER_CUSTOMS` dealer-list edge cases, and reveal/danger cue timing.
3. **M3 — iOS native:** Capacitor wrap, `@capacitor/haptics`, audio session so SFX play through the silent switch, safe-area/portrait device verification.
4. Upload `angelo-backup-20261015.zip` to Google Drive + network drive.
5. `ContentWarning.tsx` copy would fail App Store review (fine for PWA/sideload).

### Session 2026-10-15 (cont.) — Phase A: M1 Baseline Protection (COMPLETE)

Director-approved commit protocol. M1 captured and protected before any M2 code.

- **Staging decision:** `git add angelo/` (NOT `git add .`). Repo root contains ~20 unrelated untracked files (`CompTIA_*` posters, `SimMapper/`, `VR_Optimization_Backup_2026-07-11/`, `motionPose/`, `final_exports/`, `SESSION.md`, several `.zip`s) that a literal `git add .` would have swept into the baseline commit.
- **Commit:** `834af9f` — "M1: CORE MVP BASELINE COMPLETE. All structural flow (flow/steps.ts) and core component functionality are stable and ready for polish pass." (40 files changed, +1226 / −3209).
- **Branch:** `feature/m2-polish-pass` (created from `feature/ios-aaa-polish`).
- **Tag:** `v1.0.0-pre-polish` (annotated) on `834af9f`.
- **Push:** `feature/m2-polish-pass` and `v1.0.0-pre-polish` pushed to `origin`. Required `gh auth setup-git` (HTTPS remote rejected password auth; gh token has `repo` scope).
- **Physical archive:** `angelo-m2-baseline-v1.0.0-pre-polish.zip` (74 entries, 0.24 MB; angelo source only, excludes `node_modules`/`dist`/`.git`). **User to upload to Google Drive + network drive.**

#### M2 Polish Pass — approved plan (paused before any code)
- **B0 Tactility:** new `ui/components/Tap.tsx` + `useTap()`; route every interactive surface through it (gaps: HubScreen sheet buttons/steppers/quick amounts/Back, PlanScreen class toggle/Back, SceneCard qty stepper, GameShell backdrop/`✕`, legacy BankModal steppers/quick amounts). Global `:active` + `prefers-reduced-motion`.
- **B1 Pacing:** `components/RunTransition.tsx` — hybrid; full-screen cinematic only at Flight depart / Customs / Resolution / Deal close; cue firing moved from event-appearance to **phase transition**; silence beat before high-stakes reveals.
- **B2 Clarity:** render `RUN_STEPS` as progress-dot header (Plan·Flight·Deal·Home); keyed fade/slide between GameShell screens; replace "default = all bank" withdraw with trip-need estimate + copy.
- **B3 Meters (display-only, no mechanics):** Hub `StatusStrip` — Heat gauge (`getHeatLevel`: <25 low / ≥25 medium / ≥50 high / ≥80 critical, `heat.ts:14`), Credibility rating bar, Reputation fame bar. Bound to `player.heat|credibility|reputation` (0–100). No new thresholds/locks/decay.
- **B4 Continuity scan:** read-only over dealer intros/kingpin/event `context`; **report findings before any edit**.
- **B5 Verify:** `tsc -b` + full test suite green.
- **Deferred (Phase 2):** heat-decay "quiet time" mini-game, new action-locking, Assets/Safehouse lore depth, journal.

### Session 2026-10-15 (cont.) — M2 Polish Pass EXECUTED (B0–B3, B5)

Build: `tsc -b` clean, `vite build` green (77 modules, 516.18 kB), tests **38/38**. Narrative outcomes unchanged — all meter/cue/pacing work is presentation only.

- **B0 · Tactility primitive DONE.** New `ui/components/Tap.tsx` (`Tap`, `useTap()`, `fireTap()`, `TapOptions`) is the single "Click" source: one sfx + one haptic per activation, with a `.tap` press animation and `prefers-reduced-motion`. **Feedback was removed from `useGameFlow.send`** (now pure dispatch) + added `feedback()`. Every interactive surface routed through Tap: Hub (sheet buttons, start, steppers, quick amounts, back), Plan (product/class/destination/back), StashSell (stash/retrieve/kingpin/end), Run CTA, SceneCard (qty stepper, confirm, walk-away, choices), GameShell backdrop/`✕`, BankModal (all controls; now takes `send` not `dispatch`), plus intro/onboarding (ContentWarning, UniversalIntro `silent` audio-unlock gesture, BriefingScreen, LeaderboardScreen, ErrorBoundary). CSS `.tap` + reduced-motion in `index.css`.
- **B1 · Pacing DONE.** New `ui/components/RunTransition.tsx`; `useGameFlow` now derives `RunTransitionInfo` from **phase boundaries** (`transitionForPhase`) — Departing (home→flying_out), Arriving (→arrived), Back in London / Busted (→selling), Run complete (→home) — plays its cue and sets `prevEventIdRef` so the event cue doesn't double-fire. Rendered in GameShell keyed by `nonce`. CSS `.run-transition` + z-1200.
- **B2 · Clarity DONE.** New `ui/components/RunProgress.tsx` (Plan·Flight·Deal·Home spine via `currentStepIndex`, hidden on hub/scene); GameShell `<main>` keyed by `screen`/`scene:eventId` with `.screen-enter` gradient-fade; HubScreen withdraw now defaults to a computed **Suggested** amount (cheapest economy ticket + $2,000 deal buffer, rounded) with a new `Suggested` quick-button + copy. CSS `.runprogress`, `.screen-enter`.
- **B3 · Meters DONE (display-only).** New `ui/components/StatusStrip.tsx` — animated Heat (Cold/Warm/Hot/Critical via `getHeatLevel`, green→yellow→orange→red), Credibility, Reputation bars, bound to `player.heat|credibility|reputation`. Rendered on the Hub; plain Heat text row removed from `HubInfoWindow`. `AudioManager.updateFromGameState` now plays a soft `processing` cue on heat **cooldown** (relief) in addition to `alert`/`siren` on rise.
- **B4 · Continuity scan REPORTED (no edits yet).** Findings below. Awaiting user sign-off before touching any narrative string.
- **Files added:** `ui/components/{Tap,RunTransition,RunProgress,StatusStrip}.tsx`. **Modified:** `ui/flow/{useGameFlow,GameShell}.tsx`, all `ui/screens/*`, `ui/components/{SceneCard,HubSheets,BankModal,HubInfoWindow,MobileEntry,ContentWarning,UniversalIntro,BriefingScreen,LeaderboardScreen}.tsx`, `audio/{haptics,AudioManager}.ts`, `index.css`.

#### B4 Continuity findings (report-first; NOT yet applied)
1. **`$pron` never substituted on the haggle-lose path (broken logic).** `HAGGLE_LOSE.net_2[2]` (`game-engine.ts:174`) contains the literal token `$pron nails`. Only the FAREWELLS path (`:970`) replaces `$pron`; `handleNegotiate` win/lose (`:874`, `:882`) and `back_out` (`:848`) replace only `$name`. Player sees "$pron nails". Fix = add `.replace(/\$pron/g, pr.his)` to those three sites. (Verified: `$name`×76 all covered; `$pron`×4 literals — 3 in FAREWELLS covered, this 1 not; `%GOOD%`×8 covered at dealer-encounters `:1430`; `%d`×19 all in `travel.ts` via `randomMsg`.)
2. **Currency mismatch (game is dollars, tutorial says pounds).** `BriefingScreen` lines say "£5,000 in the bank" and "Keep £500 spare for bribes"; engine starts `bank: 5000` and every price/UI uses `$`. Value matches; symbol conflicts. Candidate: £→$ (factual correction).
3. **Briefing references removed UI (instruction now points at nonexistent panels).** `BriefingScreen` tells the player to use the "`[BANK]` at the top", the "Market panel", and the "Inventory panel" — M1 removed those; now Bank is a Hub sheet, product choice is the Plan screen, inventory is Stash/on-hand. This is scripted guidance that no longer matches reality.
4. **Formatting anomaly (style, likely out of scope).** `FAREWELLS.afg_1` (`:128`) glues lower-case narrative onto dialogue ("...you walk, nonce.` as you leave you notice a portrait...`"). Minor typos elsewhere (UniversalIntro "security guard..").
5. **Cosmetic content warning only:** `ContentWarning.tsx` copy would fail App Store review (App Store not a target).

Note: the `$pron` fix (#1) is clearly "broken logic"; #2 uses only presentation copy (allowed). #3 is the important one — the redesign orphaned tutorial instructions; needs a minimal factual correction, not a rewrite.

#### B4 corrections APPLIED (user approved #1–#4) + M2 commit
- **#1:** added `.replace(/\$pron/g, pr.his)` to `handleNegotiate` win/lose and `p(dealer).his` to `back_out` walk line in `game-engine.ts`.
- **#2:** `BriefingScreen` £→$ (`$5,000`, `$500`, "every dollar").
- **#3:** `BriefingScreen` UI references corrected — `[BANK]` on the hub, product on the **Plan screen**, stash in the **Stash sheet** (were: "at the top", "Market panel", "Inventory panel").
- **#4:** de-glued narration in `FAREWELLS.afg_1` (capitalised the appended sentences; "defiantly"→"definitely"); UniversalIntro "guard.."→"guard. He".
- **Verified:** `tsc -b` clean, `vite build` green, tests **38/38**.
- **Commit:** `9af603f` on `feature/m2-polish-pass` (23 files, +625/−185) — "M2: iOS AAA polish pass…" (staged `angelo/` only). **Not pushed.**
- **SESSION.md** is untracked at repo root — flag for the user to commit separately.

### Session 2026-10-16 — M3 iOS scaffolding (partial; Mac-only steps pending)

- **Installed:** `@capacitor/core@8.5.3`, `@capacitor/haptics@8.0.2` (deps); `@capacitor/cli@8.5.3`, `@capacitor/ios@8.5.3` (dev). package.json + package-lock updated.
- **New `angelo/capacitor.config.ts`:** `appId com.smuggletycoon.app`, `appName "Smuggle Tycoon"`, `webDir "dist"`, `backgroundColor #0a0a0a`, `ios.contentInset: 'never'` (we own safe-areas in CSS), `ios.preferredContentMode: 'mobile'`.
- **`audio/haptics.ts` rewritten** to the idiomatic import (`Haptics`, `ImpactStyle`, `NotificationType` from `@capacitor/haptics`) instead of the `globalThis.Capacitor.Plugins` probe. The plugin ships a real **web fallback** (`navigator.vibrate`), so web behaviour is unchanged; native proxying now automatic. Build code-splits it into `web-*.js` (0.94 kB) — no bundle bloat (index +9.7 kB to 525.89 kB).
- **Verified:** `tsc -b` clean, `vite build` green (82 modules).
- **DISCOVERED — pre-existing FLAKY test (NOT caused by M2/M3):** `game-engine.test.ts:56` "should handle START_TRIP and END_TRIP" fails ~1/3 runs. Cause: `START_TRIP` may spawn a random `pendingEvent`; responding to `choices[0]` can move cash, so `END_TRIP` deposits the bonus → `bank === 5200`, not the hard-coded `5000`. **FIXED (user-approved):** now captures `cashBefore`/`bankBefore` before `END_TRIP` and asserts conservation (`bank === bankBefore + cashBefore`, `cash === 0`) — matches `endTrip` (`bank += cash`). Verified stable **10/10** runs.
- **Not yet done (Mac-only):** `npx cap add ios` (needs CocoaPods/Xcode), `npx cap sync`, Xcode signing/run, and the AVAudioSession `.playback` config to make SFX ignore the ring/silent switch, plus portrait lock + safe-area device verification.
- **Commit:** `1eb4497` on `feature/m2-polish-pass` (5 files, +1235/−16) — "M3: iOS scaffolding…". Staged `angelo/` only. **Not pushed.**
- **Mac runbook (next session on the Mac):** `npm install` → `npm run build` → `npx cap add ios` → `npx cap sync ios` → open `ios/App/App.xcworkspace` in Xcode → set signing team → run on device. Then: portrait lock in Info.plist, native AVAudioSession `.playback` for SFX-through-silent-switch, safe-area verify. iOS bundle id = `com.smuggletycoon.app` (change before App Store submission if ever needed).

#### M3 (cont.) — iOS project generated on Windows + native pre-config + LIVE headless test

- **`npx cap add ios` SUCCEEDED on Windows** (Capacitor 8 uses SPM, not CocoaPods — no `pod`/Xcode needed to scaffold). `npx cap sync ios` also ran; web bundle copied to `ios/App/App/public`.
- **Native pre-config (source-only, no compiler needed):**
  - `ios/App/App/Info.plist`: `UISupportedInterfaceOrientations` (+ `~ipad`) locked to **Portrait** only (was phone portrait+landscape, iPad all four).
  - `ios/App/App/AppDelegate.swift`: added `import AVFoundation` + `configureAudioSession()` setting `AVAudioSession` to `.playback`/`.default`/`.mixWithOthers` and active — so SFX are audible through the ring/silent switch (the design decision flagged earlier; easily reverted to `.ambient` to respect the switch).
- **LIVE headless smoke test** (throwaway Playwright harness in `%TEMP%\opencode\smuggle-smoke`, drove live app in Edge at iPhone viewport): onboarding → briefing → hub → plan → flight → customs → contact → deal all render; **no crashes, no page errors, no failed requests**. One console `404` = **missing favicon** (harmless; home-screen icon comes from Capacitor).
- **🔴 CRITICAL SOFT-LOCK (XFAIL):** tapping **"Something's off — walk away"** on the dealer intro (`game-engine.ts:299`, choice id `back_out`) → `handleDealerIntroOrCustomQty` (`:845-851`) sets `gamePhase:'selecting_dealer'` but `pendingEvent:null`. Same at `handleHaggleLose` (`:907-910`). Then `resolveScreen` (`steps.ts:28`) routes `selecting_dealer` → `'run'`, and `RunScreen` (`screens/RunScreen.tsx` switch has no `selecting_dealer`/`returned` case → `default`) renders the **"In transit"** card with **`cta=null`** → permanent dead-end (verified via `localStorage.angelo_save`: `{phase:'selecting_dealer', pendingEvent:null, country:'colombia'}`). Repro is 100% human-reachable.
- **Papercuts found live:**
  1. Product with no London buyer (`Ecstasy`) → "No Buyer" event bounces back to product select **with the same product still selected**, easy to loop.
  2. Suggested withdrawal ($2,300 = cheapest ticket + $2,000) can be **below one minimum deal** (Cocaine→Medellín) → "Not Enough Cash — not even one deal's worth" bounce. The hub's own Suggested default can lead the player into a dead-end-ish loop.
  3. `returned` phase has the same `RunScreen` dead-end as (1) should it ever be reached (possibly dead code).
  4. No audio file requests observed during the run — verify SFX actually fire on device (may be oscillator-synth, not wav).
- **Not committed:** `ios/` platform is untracked (native project + binary icon/splash assets). Awaiting decision to commit it.
- **Recommended fix for the lock (engine, minimal):** in both `back_out` branches, rebuild and set `pendingEvent` to the `dealer_select_…` event for the current country (mirroring `handleArrival` `:811-828`) instead of `null`; narrative already says "Choose another contact or fly home". Add a Vitest case asserting `selecting_dealer` never carries `pendingEvent:null`. Optional UI hardening: give `RunScreen` a safe fallback CTA so no phase can ever hard-lock.

---

### Session 2026-10-16 — Smuggle Tycoon iOS M3: soft-lock fix + flaky-test root cause

**User approval carried in:** "Apply engine fix + test (Recommended)" and "Commit ios/ (Recommended)". (Commit itself still pending — no push requested.)

**Engine soft-lock FIX applied (`angelo/src/core/game-engine.ts`):**
- Added helper `enterDealerSelection(state, message?)` — rebuilds the `dealer_select_…` `ChoiceEvent` for the current country via `getDealerOptions(country.id, state.dealerRapport)` and sets `gamePhase:'selecting_dealer'`, `selectedDealer:null`, `pendingEvent:dealerEvent`. Falls back to `pendingEvent:null` only if the country is unknown.
- Rewired **both** `back_out` branches to call it instead of setting `pendingEvent:null`:
  - `handleDealerIntroOrCustomQty` walk-away (~`:861`) — passes the `walkLine` narration as the message.
  - `handleHaggleLose` back_out (~`:920`) — passes the "walked away…" narration as the message.
- Net effect: walking away re-offers the contact list, so `resolveScreen` routes to a real `dealer_select` event; the `RunScreen` `default` dead-end is no longer reachable via this path.

**Regression test added (`angelo/src/core/game-engine.test.ts`):**
- `should not soft-lock when walking away from a dealer (re-offers contacts)` — fabricates a deterministic `dealer_intro_test` event (avoids `getDealerOptions` random shuffle → no flake), dispatches `RESPOND_EVENT`/`back_out`, asserts `gamePhase==='selecting_dealer'`, `pendingEvent` truthy with ≥1 choice, and `selectedDealer===null`. Stable 10/10.

**Flaky test #2 — root cause found & fixed (`game-engine.test.ts` "should manage heat properly across actions", assertion at `:189`, ~5% failure `expected 50 to be less than 50`):**
- **Root cause (not the WAIT math):** `gameReducer` short-circuits at `game-engine.ts:1360` — if `state.pendingEvent` is set and the action isn't in the allowlist (`RESPOND_EVENT`/`STASH_GOODS`/`RETRIEVE_GOODS`/`CONTACT_KINGPIN`/`BUY`), it returns `state` unchanged. The test runs `START_TRIP` first, which randomly fires a **chance card** (`game-engine.ts:1373-1380`) → `pendingEvent` set → the following `WAIT` is a **no-op** → heat stays 50.
- **Correction to prior note:** the flaky assertion is at **`:189`** ("should manage heat properly across actions"), NOT `:154` ("should handle WAIT action") — `:154` builds a fresh state with no `START_TRIP`, so it is genuinely deterministic (30/30 and 40/40 clean).
- **Fix:** after `START_TRIP`, add `state = { ...state, pendingEvent: null };` — mirrors the pattern already used at `:138`/`:148`. Verified **0 fails / 40** isolated and **0 / 8** full-suite runs. `npx tsc -b` green.

**Status:** engine fix + regression test + flaky-test fix **committed** as `d8f1d7d` on `feature/m2-polish-pass` (22 files, +724/−2 — includes the newly-tracked `angelo/ios/` platform per prior approval). `npx tsc -b` green; full suite green across 8 repeats. **PUSHED to origin** (see 16b deployment note).

**Next Steps:**
1. Commit the engine soft-lock fix + deterministic tests (and `ios/` per prior approval) on `feature/m2-polish-pass` — `git add angelo/`, no push unless asked.
2. Still-open papercuts (not yet fixed): No-Buyer bounce keeps product selected; Suggested withdrawal can fall below a minimum deal; `returned` phase shares the `RunScreen` dead-end; missing favicon 404.
3. Mac runbook (unchanged) for on-device verification: `npm install` → `npm run build` → `npx cap sync ios` → open `ios/App/App.xcworkspace` in Xcode → set signing team → Run on device; verify portrait lock, safe-area, SFX-through-silent-switch.
4. User still to upload `angelo-m2-baseline-v1.0.0-pre-polish.zip` to Google Drive + network drive.

---

### Session 2026-10-16b — Smuggle Tycoon: Modular Dialogue Corpus (foundational infra)

**Director directive:** build a modular, weighted, contextual dialogue system (`getDialogue(CharacterID, SceneContext, EmotionalState)`) so hundreds of new lines can be added without touching flow logic. Build the mechanism first; do not rewrite existing dialogue code.

**Recon of the current (pre-existing) dialogue architecture — the "if-else trap":**
- `game-engine.ts` holds `DEALER_INTROS`/`FAREWELLS`/`HAGGLE_WIN`/`HAGGLE_LOSE` as `Record<dealerId, string[]>`, selected by `pool[Math.floor(Math.random()*pool.length)]` (`:289`, `:888-899`, `:985`). Placeholders `$name`/`$pron` patched inline.
- `dealer-encounters.ts` holds many scene pools keyed by `${kingpinId}` / `${kingpinId}_${outcome}` (e.g. `CLEAN_SETUPS`, `RAID_SETUPS`, `APPROACH_SETUPS`), resolved by `kp()` (`:1575`) with a bare `key[k.id] ?? ['']` fallback; `%GOOD%` via `fill()` (`:1429`).
- `travel.ts` selects with `randomMsg()`/`randomLine()` (`:102-109`), `%d`→heat.
- Common traits: uniform (unweighted) selection, no mood/prerequisite gating, content and flow entangled by key naming.

**Built (additive — NOT wired into existing flow):**
- **`src/core/dialogue.ts`** — generic engine, knows nothing about pools or game state:
  - Types: `DialogueEntry` (id, characterId, scene, mood?, weight?, prereqs?, text, once?), `DialogueContext`, `DialogueResult`, `DialogueVars`, `Prerequisite`, `GetDialogueOptions`.
  - Data layer: `DialogueCorpus` class (+ `createCorpus`, `add`, `addPool`, `forCharacter`, `clear`, `size`).
  - Trigger layer: declarative `Prerequisite` kinds — `flag`/`notFlag`/`atLeast`/`atMost`/`location`/`notLocation`/`mood`/`scene`/`custom`; `evaluatePrerequisite`, `meetsPrerequisites`.
  - Randomisation layer: `weightedPick` (cumulative-weight, injectable `Rng` → deterministic in tests); `getDialogue(characterId, scene, emotionalState?, options?)` with cascading fallback (drop mood → drop scene → caller `fallback`) and `once`-line support via a `consumed` set.
  - Rendering: `renderDialogue` supports `$name`, `$pron`, `$He/$His/$him`, `%GOOD%`, `%d`, and generic `$vars`.
  - Registry: `DEFAULT_CORPUS` + `registerCorpus(corpus, replace?)`.
- **`src/core/dialogue-corpus.ts`** — data layer / app glue:
  - `dialogueContextFromGameState(state, characterId, scene, mood?, vars?)` — read-only projection of `GameState`/`PlayerState` (turn/heat/credibility/reputation/cash/bank/netWorth/trips/busts/location + flags). No mutation.
  - `PREREQS` presets (`seasoned`, `notAtSafehouse`, `carryingGoods`, `flag`, `knowsMacau`).
  - `buildSampleCorpus()` / `SAMPLE_CORPUS` — mini-pools for `col_1` (Tony), `esp_3` (Snake), `fletcher` across `arrival`/`deal`/`farewell`/`raid`, with mood tags, weights, one `once` lore line gated by `PREREQS.knowsMacau()` (flag `soldInMacau` + not at safehouse + turn ≥ 8). `loadSampleCorpus()`.
- **`src/core/dialogue.test.ts`** — 15 tests: weighted distribution, mood filter + mood-drop fallback, prereq gating, each prereq kind, once-only via consumed set, scene widening, fallback/null, RNG determinism, placeholder rendering, state-adapter mapping, sample-corpus registration.
- **`src/core/index.ts`** — re-exports the engine (values + types) and corpus helpers.

**Verification:** `npx tsc -b` green; `npx vitest run` **54/54** (3 files); `npm run build` green. Existing flow untouched — the module is not yet imported by any screen/reducer, so runtime behaviour is unchanged.

**Next Steps:**
1. Integrate the corpus into B2/B4 phases (per directive): migrate `DEALER_INTROS`/`FAREWELLS`/`HAGGLE_*` and `dealer-encounters` `kp()` pools into `DialogueEntry` data, then call `getDialogue(...)` at those call sites — one scene at a time, verifying parity each step.
2. Author real pools for more characters/moods; decide placeholder parity (`$pron` is `his` in the legacy engine — confirm intended persona variants).
3. Optional: expose a dev/debug view that lists eligible lines for a context (authoring aid).
4. Still open from prior session: commit/push, papercuts, Mac device build.

---

### Session 2026-10-16c — Deployment: build + iOS sync + push + live verification

**Execution (Windows-side deployment steps):**
- `npm run build` — green (82 modules; real SFX asset present: `dist/assets/cash-register-DSXyA5I5.wav`, 37 kB). Main JS chunk 526 kB (pre-existing size warning).
- `npx cap sync ios` — copied fresh `dist` into `ios/App/App/public`; regenerated `capacitor.config.json` + `Package.swift` (`@capacitor/haptics@8.0.2`).
- **Pushed `feature/m2-polish-pass` to `origin`** via `gh auth setup-git` (gh authed as `BasilStillborn`, https): `834af9f..99479bf`. The Mac can now `git fetch` and build — this is the concrete deployment enabler available from Windows.
- Commits on the branch now pushed: `9af603f` (M2), `1eb4497` (M3 scaffolding), `d8f1d7d` (soft-lock fix + tests + ios/), `99479bf` (dialogue corpus infra + SESSION.md).

**Live end-to-end smoke test (Edge, iPhone 390×844, fresh production build, 136 steps):**
- **0 crash screens, 0 page errors, 0 failed requests.** Only 1 unique console error = the known favicon `404` (harmless; home-screen icon comes from Capacitor).
- **✅ Soft-lock fix VERIFIED live:** the harness repeatedly chose "Something's off — walk away" at the dealer intro; each time the app returned to **"Choose Your Contact — Medellín"** (act_7→8, 9→10, 11→12, … through act_129) instead of the old `selecting_dealer`/`pendingEvent:null` dead-end. This is the critical regression from the prior session, now fixed and confirmed in the running app.
- Full happy path exercised up to the deal: content warning → intro → briefing → hub → withdraw → chance card → product select → destination → flight confirm → customs → contact select → dealer intro. No narrative/flow breaks observed.
- **Audio caveat unchanged:** 0 `.wav/.mp3/.ogg` requests logged during the run — verify SFX actually fire on device (may be oscillator-synth for most cues; `cash-register.wav` loads only on the relevant beat).
- **Harness note (not an app bug):** the naive auto-driver always picks the last non-skip tap at the dealer-intro, so it always walks away and loops on the contact screen; it never clicks a quantity to complete a buy. Improving the driver to prefer deal options would let it reach the sell leg. No app change needed.

**Still blocked here:** iOS device build/install requires the Mac (Xcode + signing). Runbook unchanged: `git pull` → `npm install` → `npm run build` → `npx cap sync ios` → open `ios/App/App.xcworkspace` → set signing team → Run on device (verify portrait lock, safe-area, SFX-through-silent-switch).

---

### Session 2026-10-16d — iOS delivery-readiness audit + asset fixes

**Audit of the generated Xcode project (Windows-side, no compiler needed):**
- ✅ Portrait lock present (`UISupportedInterfaceOrientations` + `~ipad` = Portrait only). Display name "Smuggle Tycoon". Scene manifest + LaunchScreen wired.
- ✅ Safe areas **are** correctly handled in-app: `src/index.css:20-21` defines `--safe-top/--safe-bottom` from `env(safe-area-inset-*)` and applies them in `.gameshell__main`, `.statbar`, `.scene-card`, `.sheet`; `index.html` has `viewport-fit=cover`. (Earlier grep false-negative: PowerShell `Select-String` doesn't recurse `src/**/*.css`.)
- ✅ `capacitor.config.ts` `ios.contentInset:'never'` matches the CSS-managed safe areas. Bundle id `com.smuggletycoon.app`, deployment target iOS 15.0, `CODE_SIGN_STYLE = Automatic` (team to be chosen in Xcode).
- ❌ **Fixed:** `Info.plist` `UIRequiredDeviceCapabilities` was `armv7` (32-bit) — wrong for iOS 15+/arm64. Changed to **`arm64`**.
- ❌ **Fixed:** App icon + launch splash were **stock Capacitor placeholders**. Generated on-brand assets with Python/Pillow (script kept in `%TEMP%\opencode\smuggle-assets`, not the repo):
  - `AppIcon-512@2x.png` 1024×1024 — gold serif "A" seal on `#0a0a0a` with radial vignette.
  - `Splash.imageset/splash-2732x2732{,-1,-2}.png` 2732×2732 — mark + "ANGELO" / "THE CHRONICLES OF CRIME" wordmark, centered (crop-safe).
  - Palette matches the live theme accent `#d4a017` / bg `#0a0a0a`, so the launch screen blends into the first frame.

**Outstanding (needs decision / Mac):**
1. **Signing team** — must be selected once in Xcode (`DEVELOPMENT_TEAM` unset).
2. **Audio on device** — confirm SFX actually fire (0 `.wav` loads observed in the headless run; the safe-switch bypass via `AVAudioSession .playback` is in `AppDelegate.swift`).
3. **Main JS chunk 526 kB** — pre-existing Vite size warning; candidate for route/feature code-splitting if launch feels heavy on device.

**Committed/pushed:** `armv7→arm64` + on-brand icon/splash. Branch `feature/m2-polish-pass` stays current on origin for the Mac to pull.

---

### Session 2026-10-16e — "The Click" audit + credibility-drop cue

**Click coverage audit (Director rule #3: every interaction needs audio + haptic):**
- Confirmed the **active GameShell flow routes every interactive surface through the `Tap` primitive** (`Tap.tsx` = the single Click source: sound + haptic by construction). Grepped `src/ui/**` for raw `<button>`: only the legacy modals `CashModal`, `GameBriefingModal`, `GuideGatekeeper`, `PeakWealthModal`, `ScoreSubmitModal` still contain raw `<button onClick>` — and a repo-wide import search shows **none of them are imported anywhere** (dead code from the pre-M1 `MobileGameScreen`). No change needed; not worth touching dead files.
- `HubStatBar` (`components/HubStatBar.tsx`) uses a raw `<div onClick={onPress}>`, but `onPress` is never passed (`GameShell` renders `<HubStatBar state={state} day={day} />`) → inert, no interaction, no Click required.

**New: subtle credibility-drop cue (Director's named example — "the quiet click when credibility slips 70→69"):**
- `src/audio/sfx.ts` — new `SfxType` **`'credibility_drop'`**: a deliberately tiny descending two-note sine (330→262 Hz, amp ~0.05) — a quiet downbeat, not an alert.
- `src/ui/flow/useGameFlow.ts` — tracks `prevCredibilityRef`; on any state change where **credibility decreased**, fires `audioManager.playSfx('credibility_drop')` + `haptic('light')`. Placed after the phase-hinge and new-event branches (early-return) so it never double-fires on a cinematic beat. **Display-only — no engine/outcome change.**
- `src/ui/components/StatusStrip.tsx` + `src/index.css` — matching visual pulse `is-dropping` on the Credibility meter (`credDrop` keyframe, reduced-motion respected), mirroring the existing heat `is-easing` idiom.
- **Verified:** `npx tsc -b` green; **54/54 tests**; `npm run build` green; live headless smoke (136 steps) → **0 crashes, only the known favicon 404**.

**Files changed:** `angelo/src/audio/sfx.ts`, `angelo/src/ui/flow/useGameFlow.ts`, `angelo/src/ui/components/StatusStrip.tsx`, `angelo/src/index.css`.

**Next:** (1) route the remaining dialogue pools through the new `getDialogue(...)` corpus (migrate `DEALER_INTROS`/`FAREWELLS`/`HAGGLE_*` one scene at a time, verify parity); (2) Mac runbook unchanged (signing team → Run on device → verify SFX-through-silent-switch); (3) optional: split the 526 kB main JS chunk.

---

### Session 2026-10-16f — RC handoff (Director: "Get the build")

**Windows-side execution completed (the maximum possible here):**
- Fresh production build green (`npm run build`, 82 modules) → `npx cap sync ios` (copied `dist` → `ios/App/App/public`, registered 1 plugin). Committed + **pushed** `c90b0f7`.
- **NEW one-command Mac RC builder:** `angelo/ios/make-ipa.sh` — `npm ci` → `npm run build` → `npx cap sync ios` → `xcodebuild archive` (Release, arm64) → `xcodebuild -exportArchive` → `.ipa` at `angelo/ios/build/ipa/`. Team auto-resolved; override with `TEAM_ID=…`.
- **NEW** `angelo/ios/ExportOptions.plist` (`method: development` for direct-device; switch to `app-store` for TestFlight).
- `ios/.gitignore` now ignores `build/` (archives/ipa never committed).

**HARD BLOCKER (unchanged, physically impossible from Windows):** `.ipa` creation needs `xcodebuild` + Apple code-signing, which exist **only on macOS with Xcode**. No `pod`/`xcodebuild`/`xcrun`/`ruby`/`fastlane` here. The Mac step is now a **single command**.

**Mac delivery (single point of contact):**
1. `git pull` on `feature/m2-polish-pass` (has `c90b0f7`).
2. `bash angelo/ios/make-ipa.sh` (first run: Xcode may prompt to create scheme/signing — accept; ensure a signing team is selected).
3. Install: Xcode → Window → Devices & Simulators → drag the `.ipa` onto the iPhone → Trust in Settings → VPN & Device Management.
   - If `-scheme App` errors on first try, open `ios/App/App.xcodeproj` once in Xcode (creates the scheme), then rerun the script.

**Then:** pivot to Bug Hunting on-device (Director's mode switch) — verify portrait lock, safe-area, **SFX-through-silent-switch**, and the credibility-drop beat audibly.

**Commits now on origin:** `…bbb0337`, `7a85bb6` (Click audit + credibility cue), `c90b0f7` (RC handoff).
