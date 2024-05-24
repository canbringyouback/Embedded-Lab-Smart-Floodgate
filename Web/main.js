
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getDatabase, ref, onValue,set,get } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-database.js"
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-auth.js";


// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

var fullCapacity=200;
// Your web app's Firebase configuration

const firebaseConfig = {

  apiKey: "AIzaSyCvUTcNtedZ6iH-9TpRfEjs9TyWj7BhMJE",
  authDomain: "smart-floodgate.firebaseapp.com",
  projectId: "smart-floodgate",
  databaseURL: "https://smart-floodgate-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "smart-floodgate.appspot.com",
  messagingSenderId: "935923051238",
  appId: "1:935923051238:web:647d2a3ead3c5f6ec6a927"

};


// Initialize Firebase

const app = initializeApp(firebaseConfig);


var db = getDatabase();
const starCountRef = ref(db, 'sensors/data/waterLevel');
const stage = ref(db, 'sensors/data/motorAngle');
onValue(stage, (snapshot) => {
    const a = snapshot.val();
    if(a=="0"){
    document.getElementById('dam-gate-status-info').innerHTML = "Idle";
    document.getElementById('dam-gate-status-info').style.color=black;
    document.getElementById('dam-gate-status-info').style.fontWeight="normal";}
    else if(a=="1"){
        document.getElementById('dam-gate-status-info').innerHTML = "Working";
        document.getElementById('dam-gate-status-info').style.color=black;
        document.getElementById('dam-gate-status-info').style.fontWeight="normal";}
        
    
    else if(a=="2"){
      
            document.getElementById('dam-gate-status-info').innerHTML = "Overflow!";}
            document.getElementById('dam-gate-status-info').style.color="red";
            document.getElementById('dam-gate-status-info').style.fontWeight="bold";
    
  });
onValue(starCountRef, (snapshot) => {
  const data = snapshot.val();
  document.getElementById('current-flow').innerHTML = data + "%";
  if(parseInt(data)>95){
    document.getElementById('percentage-used-info').style.color="red";
    document.getElementById('percentage-used-info').style.fontWeight="bold";
  }
  else{
    document.getElementById('percentage-used-info').style.color="black";
        document.getElementById('percentage-used-info').style.fontWeight=200;
  }
  document.getElementById('percentage-used-info').innerHTML = data + "%";
  document.querySelector('.waterContainer').style.setProperty('--water-top-before',-100-parseInt(data)+"%" );
  document.querySelector('.waterContainer').style.setProperty('--water-top-after',-100-parseInt(data)+2+"%" );

});
 




function updateControlPanel(currentWaterLevel, remainingCapacity, percentageUsed, safetyThreshold, damGateStatus, controlMechanism, selectedUnit) {

    document.getElementById('current-flow-info').textContent = currentWaterLevel + " " + selectedUnit;
    document.getElementById('remaining-capacity-info').textContent = remainingCapacity + " " + selectedUnit;
    document.getElementById('percentage-used-info').textContent = percentageUsed + "%";
    document.getElementById('safety-threshold-info').textContent = safetyThreshold + " " + selectedUnit;
    document.getElementById('dam-gate-status-info').textContent = damGateStatus;
    document.getElementById('control-mechanism-info').textContent = controlMechanism;
}

function handleApplyButtonClick() {

var waterLimit = document.querySelector('input[name="Limit"]').value;
const username = document.querySelector('input[name="Username"]').value;
const password = document.querySelector('input[name="Password"]').value;
waterLimit = parseFloat(waterLimit);

if (waterLimit==='') {
    alert('Please fill in all fields.');
} else if ( isNaN(waterLimit)) {
    alert('Water Limit must be numeric values.');
} else if ( !Number.isInteger(waterLimit)) {
    alert('Water Limit must be integer values.');
} else if ( waterLimit < 0) {
    alert('Full Capacity and Water Limit must be non-negative.'); 
} else if (waterLimit > 95) {
    alert('Water limit cannot exceed Safety Threshold.');
} else {
   

   // document.getElementById('full-capacity').disabled = true;
    //document.getElementById('units').disabled = true;
    //document.querySelector('input[name="Limit"]').disabled = true;
    //document.getElementById('Manual').disabled = true;
    //document.getElementById('apply-button').disabled = true; 
  
  
      const auth = getAuth();
      signInWithEmailAndPassword(auth, username, password)
        .then((userCredential) => {
          // Signed in 
          const user = userCredential.user;
          document.getElementById('current-threshold').innerHTML = waterLimit + "%";
          {set(ref(db, 'Web/data'), {
            waterLevel: waterLimit
          });}
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
        });
    //updateRulerLines();
   // updateControlPanel(0,fullCapacity,100,waterLimit,"Closed",manualAuto,unitMeasurement);
   // updateWaterLimitPosition(fullCapacity,waterLimit);

   // toggleSpinAnimation();
}
}

function updateRulerLines() {
const fullCapacity = fullCapacity;

const stepSize = fullCapacity / 7;

for (let i = 1; i <= 7; i++) {
    const line = document.getElementById(`line-${i}`);
    if (line) {
        const value = Math.round(fullCapacity - (i - 1) * stepSize);
        line.style.display = 'block';
        line.textContent = value;
    }
}
}
function updateWaterLimitPosition(fullCapacity, waterLimit) {
var waterLimitElement = document.getElementById('water-limit');
var containerHeight = 280;

var percentage = (waterLimit / fullCapacity) * 100;

var newPosition = (containerHeight * ((percentage / 100)));

waterLimitElement.style.bottom = newPosition + 'px';
}

function toggleSpinAnimation() {
var settingImg = document.getElementById('setting');
var isSpinning = settingImg.style.animationPlayState === 'running';

if (isSpinning) {
    settingImg.style.animationPlayState = 'paused';
    settingImg.classList.add('stop-spin');
    document.getElementById('full-capacity').disabled = true;
    document.getElementById('units').disabled = true;
    document.querySelector('input[name="Limit"]').disabled = true;
    document.getElementById('Manual').disabled = true;
    document.getElementById('apply-button').disabled = true; 
} else {
    settingImg.style.animationPlayState = 'running';
    settingImg.classList.remove('stop-spin');
    document.getElementById('full-capacity').disabled = false;
    document.getElementById('units').disabled = false;
    document.querySelector('input[name="Limit"]').disabled = false;
    document.getElementById('Manual').disabled = false;
    document.getElementById('apply-button').disabled = false; 
}
}

document.addEventListener("DOMContentLoaded", function() {
var settingImg = document.getElementById('setting');
document.getElementById('apply-button').addEventListener('click', function() {
    handleApplyButtonClick();
});
settingImg.addEventListener('click', function() {
    toggleSpinAnimation();
});
});