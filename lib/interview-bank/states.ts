import type { BankQuestion } from './types';

// Indian states and union territories → capital. Quick active-recall cards:
// the answer's first line is the capital, any extra line is a memory aid.
type Row = [id: string, name: string, capital: string, extra?: string];

const STATES: Record<string, Row[]> = {
  'North India': [
    ['haryana', 'Haryana', 'Chandigarh', 'Shared with Punjab; Chandigarh itself is a Union Territory.'],
    ['himachal-pradesh', 'Himachal Pradesh', 'Shimla', 'Winter capital: Dharamshala.'],
    ['punjab', 'Punjab', 'Chandigarh', 'Shared with Haryana.'],
    ['rajasthan', 'Rajasthan', 'Jaipur', 'The "Pink City".'],
    ['uttar-pradesh', 'Uttar Pradesh', 'Lucknow'],
    ['uttarakhand', 'Uttarakhand', 'Dehradun', 'Summer capital: Bhararisain (Gairsain).'],
  ],
  'South India': [
    ['andhra-pradesh', 'Andhra Pradesh', 'Amaravati', 'Hyderabad was the shared capital until 2024.'],
    ['karnataka', 'Karnataka', 'Bengaluru'],
    ['kerala', 'Kerala', 'Thiruvananthapuram'],
    ['tamil-nadu', 'Tamil Nadu', 'Chennai'],
    ['telangana', 'Telangana', 'Hyderabad'],
  ],
  'East India': [
    ['bihar', 'Bihar', 'Patna'],
    ['jharkhand', 'Jharkhand', 'Ranchi'],
    ['odisha', 'Odisha', 'Bhubaneswar', 'The "Temple City of India".'],
    ['west-bengal', 'West Bengal', 'Kolkata'],
  ],
  'West India': [
    ['goa', 'Goa', 'Panaji'],
    ['gujarat', 'Gujarat', 'Gandhinagar', 'Not Ahmedabad: that is the largest city.'],
    ['maharashtra', 'Maharashtra', 'Mumbai', 'Winter capital: Nagpur.'],
  ],
  'Central India': [
    ['chhattisgarh', 'Chhattisgarh', 'Raipur', 'Nava Raipur is being built as the new administrative capital.'],
    ['madhya-pradesh', 'Madhya Pradesh', 'Bhopal', 'The "City of Lakes".'],
  ],
  'Northeast India': [
    ['arunachal-pradesh', 'Arunachal Pradesh', 'Itanagar'],
    ['assam', 'Assam', 'Dispur', 'Dispur is a locality inside Guwahati.'],
    ['manipur', 'Manipur', 'Imphal'],
    ['meghalaya', 'Meghalaya', 'Shillong'],
    ['mizoram', 'Mizoram', 'Aizawl'],
    ['nagaland', 'Nagaland', 'Kohima'],
    ['sikkim', 'Sikkim', 'Gangtok'],
    ['tripura', 'Tripura', 'Agartala'],
  ],
  'Union Territories': [
    ['andaman-nicobar', 'Andaman and Nicobar Islands', 'Sri Vijaya Puram', 'Renamed from Port Blair in 2024.'],
    ['chandigarh', 'Chandigarh', 'Chandigarh'],
    ['dnh-dd', 'Dadra and Nagar Haveli and Daman and Diu', 'Daman'],
    ['delhi', 'Delhi', 'New Delhi'],
    ['jammu-kashmir', 'Jammu and Kashmir', 'Srinagar (summer), Jammu (winter)'],
    ['ladakh', 'Ladakh', 'Leh', 'Kargil is the other district headquarters.'],
    ['lakshadweep', 'Lakshadweep', 'Kavaratti'],
    ['puducherry', 'Puducherry', 'Puducherry'],
  ],
};

export const INDIAN_STATES: BankQuestion[] = Object.entries(STATES).flatMap(([group, rows]) =>
  rows.map(([id, name, capital, extra]) => ({
    id,
    group,
    stars: 3 as const,
    difficulty: 'Easy' as const,
    q: `What is the capital of ${name}?`,
    a: [capital, ...(extra ? [extra] : [])],
  }))
);
