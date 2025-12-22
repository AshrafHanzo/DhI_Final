// Script to generate all API replacements
// Run this to see what needs to be updated

const files = [
  'Applications.tsx',
  'Screening.tsx',
  'Joined.tsx',
  'Candidates.tsx',
  'CandidateDetail.tsx',
  'ReadyToInterview.tsx',
  'JobDetail.tsx',
  'ApplicationDetail.tsx',
  'Interview.tsx',
  'Jobs.tsx',
  'SelectedCandidates.tsx'
];

console.log('Files that need API_ENDPOINTS import and localhost replacement:');
files.forEach(f => console.log(`- ${f}`));
