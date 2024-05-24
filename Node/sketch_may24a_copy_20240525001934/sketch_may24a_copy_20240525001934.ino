#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#include <SoftwareSerial.h>

#include <NTPClient.h>
#include <WiFiUdp.h>

EspSoftwareSerial::UART DataSerial;
EspSoftwareSerial::UART DataSerial1;
unsigned long dataMillis = 0;
String Data[2]={"0","0"};

WiFiUDP ntpUp;
NTPClient timeClient(ntpUp, "pool.ntp.org");

// Replace these with your network credentials
#define WIFI_SSID "***"
#define WIFI_PASSWORD "***"

// Replace with your Firebase project credentials
#define FIREBASE_HOST "***"
#define FIREBASE_AUTH "***"  // Your Firebase database secret or authentication token

#define API_KEY "***"
#define DATABASE_URL "***" 

FirebaseData firebaseData;
FirebaseAuth auth;
FirebaseConfig config;


void setup() {
  Serial.begin(115200);
  DataSerial.begin(115200, EspSoftwareSerial::SWSERIAL_8N1, D7, D8, false, 100, 100);
 // Serial1.begin(115200);
  //DataSerial1.begin(115200, EspSoftwareSerial::SWSERIAL_8N1, D4, D8, false, 100, 100);
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());

  // Firebase configuration
  // config.host = FIREBASE_HOST;
  // config.api_key = FIREBASE_AUTH;  // If using API key (optional for database secret)
  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
  // Assign the user sign-in credentials
  auth.user.email = "***";  // Optional if using database secret
  auth.user.password = "***";  // Optional if using database secret
  Serial.println("Ready to begin Firebase");
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  Update_Data();
  if (Firebase.ready() && (millis() - dataMillis > 5000 || dataMillis == 0)){ // change to 120000
    dataMillis = millis();
    timeClient.update();
    unsigned long now = timeClient.getEpochTime();
    if(WiFi.status() == WL_CONNECTED && Firebase.ready()){
  String waterLevel = Data[0]; // Simulate waterLevel reading
  String motorAngle = Data[1]; // Simulate motorAngle value
  // String waterLevel = "30"; // Simulate waterLevel reading
  // String motorAngle = "90"; // Simulate motorAngle value
  String path = "/sensors/data";
  if (Firebase.setString(firebaseData, path + "/waterLevel", waterLevel)) {
    Serial.println("Water level updated: " + String(waterLevel));
  } else {
    Serial.println("Failed to update water level: " + firebaseData.errorReason());
  }

  if (Firebase.setString(firebaseData, path + "/motorAngle", motorAngle)) {
    Serial.println("State: " + String(motorAngle));
  } else {
    Serial.println("Failed to update motor angle: " + firebaseData.errorReason());
  }

  // delay(3000); // Wait a minute before sending the next update
  if (Firebase.getString(firebaseData, "/Web/data/waterLevel")) {
    String waterLimit = firebaseData.stringData();
    Serial.print("Water Limit: ");
    Serial.println(waterLimit);

    // Send waterLevel to STM32
    DataSerial.print(waterLimit);
  } else {
    Serial.println("Failed to get water level: " + firebaseData.errorReason());
  }
}
    
  }
  // if(DataSerial.available() > 0){
    // Data[0]="";
    // Data[1]="";
    // uint8_t state=0;
  //   while(DataSerial.available()){
  //     char c = DataSerial.read();
  //     if(c=='|') state++;
  //     else Data[state]+=c;
  //   }
  //   Serial.println(Data[0]);
  //   Serial.println(Data[1]);
  // }
  // int waterLevel = Data[0].toInt(); // Simulate waterLevel reading
  // int motorAngle = Data[1].toInt(); // Simulate motorAngle value
  // String waterLevel = "30"; // Simulate waterLevel reading
  // String motorAngle = "90"; // Simulate motorAngle value

  // if(WiFi.status() == WL_CONNECTED && Firebase.ready()){
  // String waterLevel = Data[0]; // Simulate waterLevel reading
  // String motorAngle = Data[1]; // Simulate motorAngle value

  // String path = "/sensors/data";
  // if (Firebase.setString(firebaseData, path + "/waterLevel", waterLevel)) {
  //   Serial.println("Water level updated: " + String(waterLevel));
  // } else {
  //   Serial.println("Failed to update water level: " + firebaseData.errorReason());
  // }

  // if (Firebase.setString(firebaseData, path + "/motorAngle", motorAngle)) {
  //   Serial.println("Motor angle updated: " + String(motorAngle));
  // } else {
  //   Serial.println("Failed to update motor angle: " + firebaseData.errorReason());
  // }

  // // delay(3000); // Wait a minute before sending the next update
  // }
}

void Update_Data(){
  if(DataSerial.available() > 0){
    Data[0]="";
    Data[1]="";
    uint8_t state=0;
    while(DataSerial.available()){
      char c = DataSerial.read();
      if(c=='|') {
        state++;
        if(state==2) break;
        }
      else Data[state]+=c;
    }
    //Uncomment those lines below to check the value of data after update

    // Serial.println(Data[0]);
    // Serial.println(Data[1]);
  }
}

