//home/project/db/conditionQuestionsAns.ts
export interface ConditionQuestionOption {
  id: string;
  label: string;
  value: number;
}

export interface ConditionQuestion {
  id: string;
  question: string;
  tooltip: string;
  options: ConditionQuestionOption[];
  active?: boolean;
  multiSelect?: boolean;
}

export interface ConditionQuestions {
  [deviceType: string]: ConditionQuestion[];
}

const conditionQuestions: ConditionQuestions = {
  smartphone: [
    {
      id: "power",
      question: "Does your Mobile Switch on?",
      tooltip: "Your mobile should turn on, and all basic functions should work properly.",
      options: [
        { id: "yes", label: "Yes", value: 1.0 },
        { id: "no", label: "No", value: 0.40 },
      ],
    },
    {
      id: "screenCondition",
      question: "How is the Screen's Physical Condition?",
      tooltip: "Assess the screen's condition based on scratches, dents, and spots.",
      options: [
        { id: "flawless", label: "Flawless (No Scratches, No dents)", value: 1.0 },
        { id: "good", label: "Good (1-3 minor scratches, No Dents no Cracks)", value: 0.90 },
        { id: "average", label: "Average (Heavy Scratches, Dents, Chipped Glass)", value: 0.85 },
        { id: "minorSpots", label: "1-2 minor only white Spots On Screen", value: 0.80 },
        { id: "belowAverage", label: "Below Average (Cracked, Spots, Black & Green Spots, Patches, Lines)", value: 0.60 },
        { id: "duplicateDisplay", label: "Copy/Duplicate Display", value: 0.65 },
      ],
    },
    {
      id: "bodyCondition",
      question: "How is the Body's Physical Condition?",
      tooltip: "Consider scratches, dents, and any structural damage to the body.",
      options: [
        { id: "flawless", label: "Flawless (No Scratches, No dents)", value: 1.0 },
        { id: "good", label: "Good (1-3 minor scratches, No Dents no Cracks)", value: 0.90 },
        { id: "majorScratches", label: "Major scratches/2-3 minor dents", value: 0.80 },
        { id: "average", label: "Average (Heavy Scratches & Dents, Chipped Glass)", value: 0.85 },
        { id: "belowAverage", label: "Below Average (Cracked, Spot, Patches, Lines)", value: 0.70 },
        { id: "bodyBent", label: "Body Bent", value: 0.65 },
      ],
    },
    {
      id: "batteryHealth",
      question: "How is the Battery health of the device?",
      tooltip: "Battery performance is assessed based on its health percentage.",
      options: [
        { id: "good", label: "Good, more than 85%", value: 1.0 },
        { id: "between", label: "Between 80-85%", value: 0.90 },
        { id: "service", label: "Service, less than 80%", value: 0.80 },
      ],
    },
    {
      id: "cameraCondition",
      question: "What is the condition of the main Camera?",
      tooltip: "Check for scratches, dust, or malfunctions affecting the camera.",
      options: [
        { id: "flawless", label: "Flawless", value: 1.0 },
        { id: "good", label: "Good (minor scratches)", value: 0.95 },
        { id: "average", label: "Average (Heavy Scratches)", value: 0.90 },
        { id: "belowAverage", label: "Below Average (Spot on camera, Broken, Blurry image, Dust in Camera)", value: 0.80 },
      ],
    },
    {
      id: "accessories",
      question: "What accessories are available with the Device?",
      tooltip: "Select all accessories available with your mobile device.",
      multiSelect: true,
      options: [
        { id: "box", label: "Box", value: 1.0 },
        { id: "charger", label: "Original Charger", value: 0.90 },
        { id: "gstBill", label: "GST Valid Bill with the same IMEI", value: 0.98 },
        { id: "none", label: "None of the Above", value: 0.90 },
      ],
    },
    {
      id: "functionalIssues",
      question: "What are functional problems?",
      tooltip: "Check if any of these components are damaged or not working.",
      multiSelect: true,
      options: [
        { id: "working", label: "All functions working", value: 1.0 },
        { id: "earphoneJack", label: "Earphone Jack is damaged or not working", value: 0.90 },
        { id: "wifiGPS", label: "Wifi & GPS not working", value: 0.70 },
        { id: "bluetooth", label: "Bluetooth not working", value: 0.70 },
        { id: "receiver", label: "Receiver Not working", value: 0.85 },
        { id: "microphone", label: "Microphone Not Working", value: 0.90 },
        { id: "flashlight", label: "Flashlight, Proximity, Rotation, Vibrator not working", value: 0.80 },
        { id: "faceID", label: "Face ID/ Fingerprint Sensor Not working", value: 0.60 },
        { id: "frontCamera", label: "Front Camera - Not working or faulty", value: 0.80 },
        { id: "backCamera", label: "Back camera - Not working or faulty", value: 0.70 },
        { id: "speakers", label: "Speakers not working; faulty or cracked sound", value: 0.90 },
        { id: "charging", label: "Charging defect; unable to charge the phone", value: 0.90 },
        { id: "powerButton", label: "Power/Home Button faulty; hard or not working", value: 0.85 },
        { id: "volumeButton", label: "Volume Button not working", value: 0.85 },
        { id: "silentButton", label: "Silent & Volume Button (Not working)", value: 0.80 },
        { id: "noNetwork", label: "No Network Signal", value: 0.60 },
        { id: "displayTouchpad", label: "Display/Touchpad Issue", value: 0.60 },
      ],
    },
    {
      id: "purchaseIndia",
      question: "Was the device purchased in India?",
      tooltip: "Confirm if the device was originally purchased in India.",
      options: [
        { id: "yes", label: "Yes", value: 1.0 },
        { id: "no", label: "No", value: 0.90 },
      ],
    },
    {
      id: "mobileAge",
      question: "What is the age of your mobile?",
      tooltip: "Select how old your mobile device is.",
      options: [
        { id: "below3months", label: "Below 3 months (Valid bill mandatory)", value: 1.0 },
        { id: "3to6months", label: "3 months - 6 months (Valid bill mandatory)", value: 0.90 },
        { id: "6to11months", label: "6 months - 11 months (Valid bill mandatory)", value: 0.80 },
        { id: "above11months", label: "Above 11 months", value: 0.65 },
      ],
    },
  ],
  laptop: [
    {
      id: "power",
      question: "Does your laptop power on and function normally?",
      tooltip: "Your laptop should turn on and all basic functions should work properly.",
      options: [
        { id: "yes", label: "Yes", value: 1.0 },
        { id: "no", label: "No", value: 0.5 },
      ],
    },
    {
      id: "screen",
      question: "How would you describe the screen condition?",
      tooltip: "Check for cracks, scratches, or dead pixels on the screen.",
      options: [
        { id: "flawless", label: "Flawless - No scratches or marks", value: 1.0 },
        { id: "good", label: "Good - Minor scratches (not visible during use)", value: 0.9 },
        { id: "fair", label: "Fair - Visible scratches but no cracks", value: 0.8 },
        { id: "cracked", label: "Cracked - Screen has cracks but functions", value: 0.6 },
        { id: "damaged", label: "Damaged - Screen has dead pixels or display issues", value: 0.4 },
      ],
    },
    {
      id: "body",
      question: "How would you describe the body condition?",
      tooltip: "Check for dents, scratches, or other damage to the laptop body.",
      options: [
        { id: "flawless", label: "Flawless - Looks like new", value: 1.0 },
        { id: "good", label: "Good - Minor scratches or scuffs", value: 0.9 },
        { id: "fair", label: "Fair - Visible scratches or minor dents", value: 0.8 },
        { id: "poor", label: "Poor - Major scratches, dents, or damaged parts", value: 0.6 },
      ],
    },
    {
      id: "keyboard",
      question: "How is the keyboard condition?",
      tooltip: "Check if all keys work properly and there are no missing keys.",
      options: [
        { id: "excellent", label: "Excellent - All keys work perfectly", value: 1.0 },
        { id: "good", label: "Good - Minor key issues but all functional", value: 0.9 },
        { id: "fair", label: "Fair - Some keys sticky or worn out", value: 0.8 },
        { id: "poor", label: "Poor - Multiple keys not working", value: 0.6 },
      ],
    },
    {
      id: "battery",
      question: "How is the battery performance?",
      tooltip: "Consider how long the battery lasts compared to when it was new.",
      options: [
        { id: "excellent", label: "Excellent - 4+ hours on a charge", value: 1.0 },
        { id: "good", label: "Good - 2-4 hours on a charge", value: 0.9 },
        { id: "fair", label: "Fair - 1-2 hours on a charge", value: 0.8 },
        { id: "poor", label: "Poor - Only works when plugged in", value: 0.7 },
      ],
    },
    {
      id: "accessories",
      question: "Do you have the original accessories?",
      tooltip: "Original charger, box, etc.",
      options: [
        { id: "all", label: "All accessories and box", value: 1.0 },
        { id: "charger", label: "Original charger, no box", value: 0.9 },
        { id: "none", label: "No accessories", value: 0.8 },
      ],
    },
  ],
  tablet: [
    {
      id: "power",
      question: "Does your tablet power on and function normally?",
      tooltip: "Your tablet should turn on and all basic functions should work properly.",
      options: [
        { id: "yes", label: "Yes", value: 1.0 },
        { id: "no", label: "No", value: 0.5 },
      ],
    },
    {
      id: "screen",
      question: "How would you describe the screen condition?",
      tooltip: "Check for cracks, scratches, or dead pixels on the screen.",
      options: [
        { id: "flawless", label: "Flawless - No scratches or marks", value: 1.0 },
        { id: "good", label: "Good - Minor scratches (not visible when screen is on)", value: 0.9 },
        { id: "fair", label: "Fair - Visible scratches but no cracks", value: 0.8 },
        { id: "cracked", label: "Cracked - Screen has cracks but functions", value: 0.6 },
        { id: "damaged", label: "Damaged - Screen has dead pixels or touch issues", value: 0.4 },
      ],
    },
    {
      id: "body",
      question: "How would you describe the body condition?",
      tooltip: "Check for dents, scratches, or other damage to the tablet body.",
      options: [
        { id: "flawless", label: "Flawless - Looks like new", value: 1.0 },
        { id: "good", label: "Good - Minor scratches or scuffs", value: 0.9 },
        { id: "fair", label: "Fair - Visible scratches or minor dents", value: 0.8 },
        { id: "poor", label: "Poor - Major scratches, dents, or bent frame", value: 0.6 },
      ],
    },
    {
      id: "battery",
      question: "How is the battery performance?",
      tooltip: "Consider how long the battery lasts compared to when it was new.",
      options: [
        { id: "excellent", label: "Excellent - Lasts a full day", value: 1.0 },
        { id: "good", label: "Good - Lasts most of the day", value: 0.9 },
        { id: "fair", label: "Fair - Needs charging during the day", value: 0.8 },
        { id: "poor", label: "Poor - Dies quickly", value: 0.7 },
      ],
    },
    {
      id: "accessories",
      question: "Do you have the original accessories?",
      tooltip: "Original charger, cable, box, etc.",
      options: [
        { id: "all", label: "All accessories and box", value: 1.0 },
        { id: "some", label: "Some accessories, no box", value: 0.9 },
        { id: "none", label: "No accessories", value: 0.8 },
      ],
    },
  ],
  smartwatch: [
    {
      id: "power",
      question: "Does your smartwatch power on and function normally?",
      tooltip: "Your smartwatch should turn on and all basic functions should work properly.",
      options: [
        { id: "yes", label: "Yes", value: 1.0 },
        { id: "no", label: "No", value: 0.5 },
      ],
    },
    {
      id: "screen",
      question: "How would you describe the screen condition?",
      tooltip: "Check for cracks, scratches, or dead pixels on the screen.",
      options: [
        { id: "flawless", label: "Flawless - No scratches or marks", value: 1.0 },
        { id: "good", label: "Good - Minor scratches (not visible when screen is on)", value: 0.9 },
        { id: "fair", label: "Fair - Visible scratches but no cracks", value: 0.8 },
        { id: "cracked", label: "Cracked - Screen has cracks but functions", value: 0.6 },
        { id: "damaged", label: "Damaged - Screen has dead pixels or touch issues", value: 0.4 },
      ],
    },
    {
      id: "body",
      question: "How would you describe the body/case condition?",
      tooltip: "Check for scratches, dents, or other damage to the watch body.",
      options: [
        { id: "flawless", label: "Flawless - Looks like new", value: 1.0 },
        { id: "good", label: "Good - Minor scratches or scuffs", value: 0.9 },
        { id: "fair", label: "Fair - Visible scratches or minor dents", value: 0.8 },
        { id: "poor", label: "Poor - Major scratches or dents", value: 0.6 },
      ],
    },
    {
      id: "band",
      question: "How is the condition of the watch band?",
      tooltip: "Check for wear and tear on the watch band.",
      options: [
        { id: "excellent", label: "Excellent - Like new", value: 1.0 },
        { id: "good", label: "Good - Minor wear", value: 0.9 },
        { id: "fair", label: "Fair - Visible wear but functional", value: 0.8 },
        { id: "poor", label: "Poor - Heavily worn or damaged", value: 0.7 },
        { id: "missing", label: "Missing - No band included", value: 0.6 },
      ],
    },
    {
      id: "accessories",
      question: "Do you have the original accessories?",
      tooltip: "Original charger, cable, box, etc.",
      options: [
        { id: "all", label: "All accessories and box", value: 1.0 },
        { id: "some", label: "Some accessories, no box", value: 0.9 },
        { id: "none", label: "No accessories", value: 0.8 },
      ],
    },
  ],
};

export default conditionQuestions;