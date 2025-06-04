// /backend/utils/groupHelper.js

/**
 * Determines the age group based on the given age.
 *
 * Age groups:
 * - 26 to 199: "Familles"
 * - 12 to 25: "Jeunesse"
 * - 6 to 11: "Enfence/Réseau"
 * - Otherwise: "Uncategorized"
 *
 * @param {number} age - The numerical age used to classify the group.
 * @returns {string} The corresponding age group label.
 */
module.exports = function groupFromAge(age) {
  // Ensure age is a positive number.
  if (typeof age !== 'number' || age <= 0) return 'Uncategorized';

  if (age >= 26 && age <= 199) return 'Familles';
  if (age >= 12 && age <= 25) return 'Jeunesse';
  if (age >= 6 && age <= 11) return 'Enfence/Réseau';
  
  return 'Uncategorized';
};
