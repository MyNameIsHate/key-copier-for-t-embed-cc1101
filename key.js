// Key Copier App for T-Embed CC1101 (Numbers 3px Above Line Guaranteed)

// Background color options
var bgColors = [
  { name: "Orange", color: 0xFD40, text: 0x0000 }, // #FE8A2C
  { name: "White",  color: 0xFFFF, text: 0x0000 },
  { name: "Black",  color: 0x0000, text: 0xFFFF }
];
var bgIndex = 0;
var bgColor = bgColors[bgIndex].color;
var textColor = bgColors[bgIndex].text;

var screenWidth = width();
var screenHeight = height();

// Key profiles
var keyProfiles = {
    "KW1":  { pins: 5, spacing: 38 },
    "SC1":  { pins: 5, spacing: 36 },
    "Y1":   { pins: 5, spacing: 34 },
    "KW10": { pins: 6, spacing: 32 }
};
var keywayNames = ["KW1", "SC1", "Y1", "KW10"];
var keywayIndex = 0;
var keyway = keywayNames[keywayIndex];

var cuts = [];
var currentPin = 0;
var baseY = 70;
var pinSpacing = keyProfiles[keyway].spacing;
var exitApp = false;

// Actual font height for setTextSize(2)
var FONT_HEIGHT = 16;

function initCuts() {
    cuts = [];
    var pins = keyProfiles[keyway].pins;
    for (var i = 0; i < pins; i++) cuts.push(1);
    currentPin = 0;
    pinSpacing = keyProfiles[keyway].spacing;
}

// Draw thick lines for better visibility
function drawThickLine(x0, y0, x1, y1, color) {
    var x0i = Math.floor(x0), y0i = Math.floor(y0);
    var x1i = Math.floor(x1), y1i = Math.floor(y1);

    drawLine(x0i, y0i, x1i, y1i, color);
    drawLine(x0i, y0i + 1, x1i, y1i + 1, color);
    drawLine(x0i, y0i - 1, x1i, y1i - 1, color);
}

// Draw the editable key
function drawKey() {
    fillScreen(bgColor);

    // Title
    setTextSize(2);
    setTextColor(textColor);
    drawString("Keyway: " + keyway, 5, 5);

    // Draw key blade
    var x = 10;
    for (var i = 0; i < cuts.length; i++) {
        var cut = cuts[i];
        var grooveY = baseY + (cut - 1) * 3;
        var nextX = x + pinSpacing;

        // Draw blade slope
        drawThickLine(x, baseY, x + Math.floor(pinSpacing/2), grooveY, textColor);
        drawThickLine(x + Math.floor(pinSpacing/2), grooveY, nextX, baseY, textColor);

        // Compute number position: top-left corner of the text
        var numX = x + Math.floor(pinSpacing / 2) - 4;
        var numY = grooveY - FONT_HEIGHT - 3; // 3px gap below the number

        // Draw depth number
        setTextSize(2);
        drawString(cut.toString(), numX, numY);

        // Active pin arrow above the number
        if (i === currentPin) drawString("v", numX, numY - 12);

        x = nextX;
    }

    // End horizontal blade
    drawThickLine(x, baseY, x + 12, baseY, textColor);

    // Controls help
    setTextSize(1);
    drawString("Prev/Next=Move Sel=Depth Esc=Exit", 5, screenHeight - 15);
}

// Round-robin depth change
function changeDepth(delta) {
    cuts[currentPin] += delta;
    if (cuts[currentPin] > 9) cuts[currentPin] = 1;
    if (cuts[currentPin] < 1) cuts[currentPin] = 9;
}

// Color selection menu with preview
function drawColorMenu() {
    fillScreen(0x0000);
    setTextSize(2);
    setTextColor(0xFFFF);
    drawString("Select Color", 40, 20);

    setTextSize(2);
    for (var i = 0; i < bgColors.length; i++) {
        var y = 60 + i * 25;
        var prefix = (i === bgIndex) ? "> " : "  ";
        drawString(prefix + bgColors[i].name, 40, y);

        // Preview rectangle
        var color = bgColors[i].color;
        drawFillRect(10, y, 20, 15, color);
    }

    setTextSize(1);
    drawString("Prev/Next=Scroll Sel=Choose", 10, screenHeight - 15);
}

// Keyway selection menu
function drawMenu() {
    fillScreen(0x0000);
    setTextSize(2);
    setTextColor(0xFFFF);
    drawString("Select Keyway", 30, 20);

    setTextSize(2);
    for (var i = 0; i < keywayNames.length; i++) {
        var y = 60 + i * 25;
        var prefix = (i === keywayIndex) ? "> " : "  ";
        drawString(prefix + keywayNames[i], 60, y);
    }

    setTextSize(1);
    drawString("Prev/Next=Scroll Sel=Choose", 10, screenHeight - 15);
}

// ---------------- Main Loop ----------------
while (!exitApp) {
    // --- Color Selection ---
    var dirty = true;
    while (!exitApp) {
        if (dirty) { drawColorMenu(); dirty = false; }

        if (getNextPress()) {
            bgIndex = (bgIndex + 1) % bgColors.length;
            dirty = true;
            delay(150);
        }
        if (getPrevPress()) {
            bgIndex = (bgIndex - 1 + bgColors.length) % bgColors.length;
            dirty = true;
            delay(150);
        }
        if (getSelPress()) {
            bgColor = bgColors[bgIndex].color;
            textColor = bgColors[bgIndex].text;
            delay(200);
            break;
        }
        if (getEscPress()) {
            fillScreen(0x0000);
            setTextColor(0xFFFF);
            drawString("Exiting...", 80, Math.floor(screenHeight/2));
            delay(500);
            exitApp = true;
            break;
        }
        delay(50);
    }

    if (exitApp) break;

    // --- Keyway Selection ---
    dirty = true;
    while (!exitApp) {
        if (dirty) { drawMenu(); dirty = false; }

        if (getNextPress()) {
            keywayIndex = (keywayIndex + 1) % keywayNames.length;
            keyway = keywayNames[keywayIndex];
            dirty = true;
            delay(150);
        }
        if (getPrevPress()) {
            keywayIndex = (keywayIndex - 1 + keywayNames.length) % keywayNames.length;
            keyway = keywayNames[keywayIndex];
            dirty = true;
            delay(150);
        }
        if (getSelPress()) {
            keyway = keywayNames[keywayIndex];
            initCuts();
            delay(200);
            break;
        }
        if (getEscPress()) {
            fillScreen(0x0000);
            setTextColor(0xFFFF);
            drawString("Exiting...", 80, Math.floor(screenHeight/2));
            delay(500);
            exitApp = true;
            break;
        }
        delay(50);
    }

    if (exitApp) break;

    // --- Key Editing Stage ---
    dirty = true;
    while (!exitApp) {
        if (dirty) { drawKey(); dirty = false; }

        if (getNextPress()) {
            currentPin = (currentPin + 1) % cuts.length;
            dirty = true;
            delay(150);
        }
        if (getPrevPress()) {
            currentPin = (currentPin - 1 + cuts.length) % cuts.length;
            dirty = true;
            delay(150);
        }
        if (getSelPress()) {
            changeDepth(1);
            dirty = true;
            delay(150);
        }
        if (getEscPress()) {
            break;
        }
        delay(50);
    }
}
