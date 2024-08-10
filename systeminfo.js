//
//Version 1.0
//Author: Christian Böö
//
//Dieses Script sammelt Systeminformationen und speichert sie als txt-File auf dem Flipper Zero USB-Stick
//

//Requirements
let badusb = require("badusb");
let usbdisk = require("usbdisk");
let storage = require("storage");
let dialog = require("dialog");
//Infos zum USB-Image
let image = "/ext/apps_data/mass_storage/Cb.img";
let size = 16 * 1024 * 1024; // 16 MB
//Tastaturspracheinstellungen
//ACHTUNG MUSS ZU DEN PC EINSTELLUNGEN PASSEN
let layout = "de-DE";

// Check ob Image vorhanden
print("Suche Image Datei...");
if (storage.exists(image)) {
    print("Datei existiert.");
} else {
    print("Image erstellen...");
    usbdisk.createImage(image, size);
}

// BadUSB-verbindung herstellen mit dem unter "layout" definierten Layout
badusb.setup({ vid: 0xAAAA, pid: 0xBBBB, mfr_name: "Flipper", prod_name: "Zero", layout_path: "/ext/badusb/assets/layouts/" + layout + ".kl" });
print("Waiting for connection");
while (!badusb.isConnected()) {
    delay(1000);
}

dialog.message("Systeminfos lesen", "OK zum Starten");

//Ausführen öffnen
print ("Ausführen öffnen...");
badusb.press("GUI","r");
delay(500);

//cmd eingeben - println führt automatisch Enter aus
print ("CMD tippen...");
badusb.println("cmd");
delay(500);

//zum Desktop wechseln
print ("zum Desktop....");
badusb.println("cd Desktop");
delay (500);

//systeminfo ausführen und in sysinfo.txt schreiben
print ("Infos sammeln.....");
badusb.println("systeminfo > sysinfo.txt");
delay (3000);

//cmd schließen
print ("CMD schließen.....");
badusb.press("ALT","F4");
delay (500);

dialog.message("Fertig!", "OK");


