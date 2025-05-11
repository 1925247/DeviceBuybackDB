// src/db/diagnosticQuestionsAns.ts

/**
 * Represents a single option for a diagnostic question.
 */
export interface DiagnosticQuestionOption {
  /** Unique identifier for the option */
  id: string;
  /** Display label for the option */
  label: string;
  /** Numeric value associated with the option (e.g., score or weight) */
  value: number;
}

/**
 * Represents a single diagnostic question for a device type.
 */
export interface DiagnosticQuestion {
  /** Unique identifier for the question */
  id: string;
  /** The question text shown to the admin/user */
  question: string;
  /** Tooltip or helper text for additional context */
  tooltip: string;
  /** List of selectable options for this question */
  options: DiagnosticQuestionOption[];
  /** Whether the question is active (available for use) */
  active: boolean;
  /** Whether multiple options can be selected */
  multiSelect: boolean;
}

/**
 * Group of diagnostic questions keyed by device type.
 * E.g., "smartphone", "tablet", "laptop".
 */
export interface DiagnosticQuestions {
  [deviceType: string]: DiagnosticQuestion[];
}

/**
 * Sample diagnostic questions data.
 * Add or remove device types and questions as needed.
 */
const diagnosticQuestionsData: DiagnosticQuestions = {
  smartphone: [
    {
      id: 'q-smartphone-power-01',
      question: 'Does the device power on?',
      tooltip: 'Check if the screen lights up when pressing the power button.',
      options: [
        { id: 'opt-yes', label: 'Yes', value: 1.0 },
        { id: 'opt-no', label: 'No', value: 0.0 },
      ],
      active: true,
      multiSelect: false,
    },
    {
      id: 'q-smartphone-screen-01',
      question: 'Is the screen cracked or damaged?',
      tooltip: 'Inspect for cracks, dead pixels, or discoloration.',
      options: [
        { id: 'opt-none', label: 'No damage', value: 1.0 },
        { id: 'opt-minor', label: 'Minor scratches', value: 0.7 },
        { id: 'opt-major', label: 'Major cracks', value: 0.3 },
      ],
      active: true,
      multiSelect: false,
    },
  ],
  laptop: [
    {
      id: 'q-laptop-battery-01',
      question: 'How is the battery health?',
      tooltip: 'Use OS diagnostics to check battery cycle count and capacity.',
      options: [
        { id: 'opt-excellent', label: 'Excellent (> 90%)', value: 1.0 },
        { id: 'opt-good', label: 'Good (70-90%)', value: 0.8 },
        { id: 'opt-fair', label: 'Fair (50-70%)', value: 0.5 },
        { id: 'opt-poor', label: 'Poor (< 50%)', value: 0.2 },
      ],
      active: true,
      multiSelect: false,
    },
  ],
  tablet: [], // no questions configured yet
};

export default diagnosticQuestionsData;
