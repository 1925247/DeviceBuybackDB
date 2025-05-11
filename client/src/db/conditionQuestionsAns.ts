// Temporary condition questions data before connecting to the database
const conditionQuestions = [
  {
    id: 1,
    question: "Is the device powered on and functioning?",
    options: [
      { id: 1, text: "Yes, it works perfectly", value: 1.0, description: "The device powers on and all functions work as expected" },
      { id: 2, text: "Yes, but with some issues", value: 0.8, description: "The device powers on but has minor functional issues" },
      { id: 3, text: "No, it doesn't power on", value: 0.4, description: "The device does not power on but may be repairable" },
      { id: 4, text: "No, it's completely dead", value: 0.2, description: "The device is non-functional and likely not repairable" }
    ]
  },
  {
    id: 2,
    question: "How would you describe the condition of the device's screen?",
    options: [
      { id: 5, text: "Perfect - No scratches or damage", value: 1.0, description: "The screen is in perfect condition with no visible scratches or damage" },
      { id: 6, text: "Good - Minor scratches, not visible when on", value: 0.9, description: "The screen has minor scratches that are not visible when the display is on" },
      { id: 7, text: "Fair - Noticeable scratches", value: 0.7, description: "The screen has noticeable scratches that may be visible when the display is on" },
      { id: 8, text: "Poor - Cracks or significant damage", value: 0.5, description: "The screen has cracks or significant damage that affects usability" }
    ]
  },
  {
    id: 3,
    question: "How would you describe the condition of the device's body/frame?",
    options: [
      { id: 9, text: "Perfect - Like new", value: 1.0, description: "The body/frame is in perfect condition with no visible wear or damage" },
      { id: 10, text: "Good - Minor wear, small scratches", value: 0.9, description: "The body/frame has minor wear or small scratches that don't affect functionality" },
      { id: 11, text: "Fair - Visible wear and tear", value: 0.7, description: "The body/frame has visible wear and tear, scratches, or minor dents" },
      { id: 12, text: "Poor - Significant damage, dents, or missing parts", value: 0.5, description: "The body/frame has significant damage, major dents, or missing parts" }
    ]
  },
  {
    id: 4,
    question: "What is the battery condition?",
    options: [
      { id: 13, text: "Excellent - Holds charge like new", value: 1.0, description: "The battery holds charge like new, lasts a full day with normal use" },
      { id: 14, text: "Good - Holds charge well, 80%+ capacity", value: 0.9, description: "The battery holds charge well, at least 80% of original capacity" },
      { id: 15, text: "Fair - Battery life reduced, 50-80% capacity", value: 0.7, description: "Battery life is noticeably reduced, between 50-80% of original capacity" },
      { id: 16, text: "Poor - Needs frequent charging, below 50% capacity", value: 0.5, description: "Battery requires frequent charging, below 50% of original capacity" },
      { id: 17, text: "Very Poor - Barely holds charge", value: 0.3, description: "Battery barely holds charge and needs to be plugged in most of the time" }
    ]
  },
  {
    id: 5,
    question: "Are all buttons, ports, and speakers functioning properly?",
    options: [
      { id: 18, text: "Yes, all are working perfectly", value: 1.0, description: "All buttons, ports, and speakers function as expected" },
      { id: 19, text: "Minor issues with some functions", value: 0.8, description: "Minor issues with some buttons, ports, or speakers, but mostly functional" },
      { id: 20, text: "Several functions not working", value: 0.6, description: "Several buttons, ports, or speakers are not functioning properly" },
      { id: 21, text: "Many functions not working", value: 0.4, description: "Many buttons, ports, or speakers are not functioning" }
    ]
  },
  {
    id: 6,
    question: "Has the device ever been repaired with non-original parts?",
    options: [
      { id: 22, text: "No, all original parts", value: 1.0, description: "The device has never been repaired and has all original parts" },
      { id: 23, text: "Yes, professionally repaired with quality parts", value: 0.8, description: "The device has been professionally repaired with high-quality parts" },
      { id: 24, text: "Yes, repaired with third-party parts", value: 0.6, description: "The device has been repaired with third-party non-original parts" },
      { id: 25, text: "Yes, DIY or low-quality repair", value: 0.4, description: "The device has undergone DIY or low-quality repairs" }
    ]
  }
];

export default conditionQuestions;