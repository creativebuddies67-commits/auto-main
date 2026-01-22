// Global questionnaire questions (20 questions for rooftop onboarding)
export interface Question {
  id: string;
  question: string;
  required: boolean;
  placeholder?: string;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
}

export const QUESTIONNAIRE_QUESTIONS: Question[] = [
  {
    id: 'dealership_name',
    question: 'What is the official name of your dealership?',
    required: true,
    type: 'text',
    placeholder: 'e.g., ABC Motors Service Center'
  },
  {
    id: 'primary_contact',
    question: 'Who is the primary contact for service department inquiries?',
    required: true,
    type: 'text',
    placeholder: 'Name and title'
  },
  {
    id: 'phone_number',
    question: 'What is the main service department phone number?',
    required: true,
    type: 'text',
    placeholder: '(555) 123-4567'
  },
  {
    id: 'email_address',
    question: 'What email should be used for service appointment confirmations?',
    required: true,
    type: 'text',
    placeholder: 'service@dealership.com'
  },
  {
    id: 'appointment_lead_time',
    question: 'What is the minimum lead time for scheduling appointments?',
    required: true,
    type: 'select',
    options: ['Same day', 'Next day', '2 days', '3+ days']
  },
  {
    id: 'services_offered',
    question: 'What services does your service department offer?',
    required: true,
    type: 'textarea',
    placeholder: 'e.g., Oil changes, tire rotations, brake service, etc.'
  },
  {
    id: 'express_service',
    question: 'Do you offer express/quick service options?',
    required: true,
    type: 'select',
    options: ['Yes', 'No']
  },
  {
    id: 'loaner_vehicles',
    question: 'Do you provide loaner vehicles or shuttle service?',
    required: true,
    type: 'select',
    options: ['Loaner vehicles', 'Shuttle service', 'Both', 'Neither']
  },
  {
    id: 'wait_area_amenities',
    question: 'What amenities are available in your waiting area?',
    required: false,
    type: 'textarea',
    placeholder: 'e.g., WiFi, coffee, TV, snacks'
  },
  {
    id: 'payment_methods',
    question: 'What payment methods do you accept?',
    required: true,
    type: 'textarea',
    placeholder: 'e.g., Cash, credit cards, financing options'
  },
  {
    id: 'warranty_work',
    question: 'Do you handle warranty work for all brands you service?',
    required: true,
    type: 'select',
    options: ['Yes, all brands', 'Only specific brands', 'No warranty work']
  },
  {
    id: 'recall_handling',
    question: 'How do you handle recall notifications and scheduling?',
    required: true,
    type: 'textarea',
    placeholder: 'Describe your recall handling process'
  },
  {
    id: 'appointment_confirmation',
    question: 'How do you confirm appointments with customers?',
    required: true,
    type: 'select',
    options: ['Phone call', 'Text message', 'Email', 'Multiple methods']
  },
  {
    id: 'after_hours_support',
    question: 'Is there after-hours support or emergency service available?',
    required: false,
    type: 'textarea',
    placeholder: 'Describe any after-hours options'
  },
  {
    id: 'special_promotions',
    question: 'Are there any current service promotions or coupons?',
    required: false,
    type: 'textarea',
    placeholder: 'List any current offers'
  },
  {
    id: 'tire_services',
    question: 'What tire services do you offer?',
    required: true,
    type: 'textarea',
    placeholder: 'e.g., Rotation, balancing, new tire sales, alignment'
  },
  {
    id: 'parts_ordering',
    question: 'How do you handle parts that need to be ordered?',
    required: true,
    type: 'textarea',
    placeholder: 'Describe your parts ordering process and typical wait times'
  },
  {
    id: 'customer_communication',
    question: 'How do you keep customers updated during service?',
    required: true,
    type: 'select',
    options: ['Phone calls', 'Text updates', 'App notifications', 'Customer portal']
  },
  {
    id: 'competitor_differentiators',
    question: 'What makes your service department stand out from competitors?',
    required: false,
    type: 'textarea',
    placeholder: 'Describe your unique value propositions'
  },
  {
    id: 'additional_notes',
    question: 'Any additional information the AI agent should know?',
    required: false,
    type: 'textarea',
    placeholder: 'Any other important details'
  }
];

// US Timezones for rooftop configuration
export const US_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' }
];

// Rulebook template - used verbatim per spec
export const RULEBOOK_TEMPLATE = `# Service Department Rulebook

## Dealership Information
- **Dealership Name**: {{dealership_name}}
- **Primary Contact**: {{primary_contact}}
- **Phone Number**: {{phone_number}}
- **Email**: {{email_address}}

## Location & Hours
- **Service Address**: {{service_address}}
- **Weekday Hours**: {{weekday_hours}}
- **Saturday Hours**: {{saturday_hours}}

## Appointment Scheduling
- **Minimum Lead Time**: {{appointment_lead_time}}
- **Confirmation Method**: {{appointment_confirmation}}

## Services Offered
{{services_offered}}

### Express Service
{{express_service}}

### Tire Services
{{tire_services}}

## Customer Amenities
- **Transportation**: {{loaner_vehicles}}
- **Waiting Area**: {{wait_area_amenities}}

## Warranty & Recalls
- **Warranty Work**: {{warranty_work}}
- **Recall Handling**: {{recall_handling}}

## Parts & Ordering
{{parts_ordering}}

## Payment Options
{{payment_methods}}

## Customer Communication
- **Update Method**: {{customer_communication}}
- **After Hours Support**: {{after_hours_support}}

## Promotions
{{special_promotions}}

## Differentiators
{{competitor_differentiators}}

## Additional Notes
{{additional_notes}}
`;
