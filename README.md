# FPSIndicator for chromium-based browsers

A simple extension aimed at measuring client FPS on an active tab.

This extension makes use of the `requestAnimationFrame()` method available in all chromium-based and all major browsers.

## Usage

### Toggling

---

To start measuring FPS, use the following key combination `Control` + `Shift` + `F`

This will bring up a small window on the upper left corner of your active tab, which will contain your current FPS and a 60-second graph of your FPS.

To close this window, simply repeat the same key combination.

---

If you want to see slightly more detailed information, you can do so by doubleclicking the already open window.

This will extend the window to now show your highest achieved FPS, average FPS and lowest achieved FPS.

#### Notice

The **lowest FPS** measurement will likely be 0 since when a tab is not currently open and is running in background, possibly CPU intensive tasks will be suspended/slowed down, which in turn causes the FPS to go as low as 0.

### Dragging around

You can reposition the window by holding down the `Control` key, upon which the window should indicate that it can be dragged and once that happens, you are free to drag the window anywhere to your liking.

Once you find your comfortable spot, simply stop holding `Control` and the window will become fixed again.

## TODO

In the future you may expect these features

- ~~Frametime (delta) measurements~~ Upcoming commit & release (v1.1)
- Per-website FPS statistics scrapper
- Better design
- ~~Saving window positions~~ Upcoming commit & release (v1.1)
- Create an icon/a logo
- ~~Implement drag safe-area~~ Upcoming commit & release (v1.1)
