/**
 * Enhanced condition questions API for 4-step assessment flow
 */

export async function getEnhancedConditionQuestions(req, res) {
  try {
    const { deviceType, brand, model } = req.params;
    
    console.log('Enhanced condition questions request:', { deviceType, brand, model });
    
    // Enhanced questions with categories for 4-step assessment
    const questions = [
      // Physical Condition Questions
      {
        id: 1,
        question_text: "What is the overall physical condition of your device?",
        description: "Check for scratches, dents, or other physical damage on the body",
        category: "physical",
        group: "physical",
        type: "multiple_choice",
        required: true,
        answer_choices: [
          { id: 1, choice_text: "Excellent - Like new", description: "No visible wear or damage", impact_percentage: 0 },
          { id: 2, choice_text: "Good - Minor wear", description: "Light scratches or wear", impact_percentage: -15 },
          { id: 3, choice_text: "Fair - Visible wear", description: "Noticeable scratches or scuffs", impact_percentage: -30 },
          { id: 4, choice_text: "Poor - Significant damage", description: "Major scratches, dents, or cracks", impact_percentage: -50 }
        ]
      },
      {
        id: 2,
        question_text: "Are there any cracks or damage to the device body?",
        description: "Check the back, sides, and frame of the device",
        category: "physical",
        group: "physical",
        type: "multiple_choice",
        required: true,
        answer_choices: [
          { id: 5, choice_text: "No damage", description: "Body is intact", impact_percentage: 0 },
          { id: 6, choice_text: "Minor hairline cracks", description: "Very small cracks", impact_percentage: -20 },
          { id: 7, choice_text: "Visible cracks", description: "Noticeable cracks", impact_percentage: -40 },
          { id: 8, choice_text: "Severely damaged", description: "Major cracks or broken parts", impact_percentage: -70 }
        ]
      },
      // Screen & Display Questions
      {
        id: 3,
        question_text: "What is the condition of the screen?",
        description: "Check for cracks, scratches, or display issues",
        category: "screen",
        group: "screen",
        type: "multiple_choice",
        required: true,
        answer_choices: [
          { id: 9, choice_text: "Perfect - No damage", description: "Screen is flawless", impact_percentage: 0 },
          { id: 10, choice_text: "Minor scratches", description: "Light scratches not affecting visibility", impact_percentage: -10 },
          { id: 11, choice_text: "Visible cracks", description: "Cracks but display works", impact_percentage: -40 },
          { id: 12, choice_text: "Severely damaged", description: "Major cracks or display issues", impact_percentage: -70 }
        ]
      },
      {
        id: 4,
        question_text: "How is the display quality and touch response?",
        description: "Test screen brightness, colors, and touch sensitivity",
        category: "screen",
        group: "screen",
        type: "multiple_choice",
        required: true,
        answer_choices: [
          { id: 13, choice_text: "Excellent - Works perfectly", description: "Bright, responsive, accurate colors", impact_percentage: 0 },
          { id: 14, choice_text: "Good - Minor issues", description: "Slight dimming or touch lag", impact_percentage: -15 },
          { id: 15, choice_text: "Fair - Noticeable issues", description: "Display problems or touch issues", impact_percentage: -30 },
          { id: 16, choice_text: "Poor - Major problems", description: "Severe display or touch problems", impact_percentage: -50 }
        ]
      },
      // Functionality Questions
      {
        id: 5,
        question_text: "Are all buttons and ports working properly?",
        description: "Test power button, volume buttons, charging port, and headphone jack",
        category: "functionality",
        group: "functionality",
        type: "multiple_choice",
        required: true,
        answer_choices: [
          { id: 17, choice_text: "All working perfectly", description: "Every button and port functions normally", impact_percentage: 0 },
          { id: 18, choice_text: "Most working, minor issues", description: "One or two buttons slightly sticky", impact_percentage: -15 },
          { id: 19, choice_text: "Some not working", description: "Some buttons or ports don't work", impact_percentage: -30 },
          { id: 20, choice_text: "Major functionality issues", description: "Multiple buttons or ports broken", impact_percentage: -45 }
        ]
      },
      {
        id: 6,
        question_text: "How are the camera and audio functions?",
        description: "Test camera quality, microphone, and speaker performance",
        category: "functionality",
        group: "functionality",
        type: "multiple_choice",
        required: true,
        answer_choices: [
          { id: 21, choice_text: "Excellent - All work perfectly", description: "Clear photos, good audio quality", impact_percentage: 0 },
          { id: 22, choice_text: "Good - Minor issues", description: "Slight quality reduction", impact_percentage: -10 },
          { id: 23, choice_text: "Fair - Noticeable problems", description: "Camera or audio issues", impact_percentage: -25 },
          { id: 24, choice_text: "Poor - Major problems", description: "Camera or audio not working", impact_percentage: -40 }
        ]
      },
      // Battery & Performance Questions
      {
        id: 7,
        question_text: "How is the battery performance?",
        description: "Consider how long the battery lasts and charging behavior",
        category: "battery",
        group: "battery",
        type: "multiple_choice",
        required: true,
        answer_choices: [
          { id: 25, choice_text: "Excellent - Lasts all day", description: "Battery life like new", impact_percentage: 0 },
          { id: 26, choice_text: "Good - Needs charging once a day", description: "Normal daily charging", impact_percentage: -10 },
          { id: 27, choice_text: "Fair - Needs frequent charging", description: "Multiple charges per day", impact_percentage: -25 },
          { id: 28, choice_text: "Poor - Battery drains quickly", description: "Very short battery life", impact_percentage: -40 }
        ]
      },
      {
        id: 8,
        question_text: "How is the overall device performance?",
        description: "Consider speed, app loading times, and system responsiveness",
        category: "battery",
        group: "battery",
        type: "multiple_choice",
        required: true,
        answer_choices: [
          { id: 29, choice_text: "Excellent - Fast and responsive", description: "No lag or performance issues", impact_percentage: 0 },
          { id: 30, choice_text: "Good - Occasional slowdowns", description: "Minor performance issues", impact_percentage: -15 },
          { id: 31, choice_text: "Fair - Noticeable lag", description: "Regular performance problems", impact_percentage: -30 },
          { id: 32, choice_text: "Poor - Very slow", description: "Severe performance issues", impact_percentage: -50 }
        ]
      }
    ];
    
    console.log('Returning 8 enhanced condition questions for 4-step assessment');
    res.json(questions);
  } catch (error) {
    console.error('Error getting enhanced condition questions:', error);
    res.status(500).json({ error: 'Failed to get enhanced condition questions' });
  }
}