/**
 * Pythagoras Psychomatrix Calculator
 *
 * Implements the classical Pythagoras numerology algorithm to compute
 * a 3x3 digit matrix from a person's birthdate, along with working
 * numbers and line analysis (rows, columns, diagonals).
 */

export interface MatrixResult {
  /** Position 1-9 mapped to array of that digit (e.g. position 1 -> [1,1,1]) */
  grid: Record<number, number[]>;
  /** The four working numbers derived from the birthdate */
  workingNumbers: [number, number, number, number];
  /** Line counts for rows, columns, and diagonals */
  lines: {
    rows: [number, number, number];
    columns: [number, number, number];
    diagonalDown: number; // positions 1,5,9
    diagonalUp: number; // positions 3,5,7
  };
  /** Total number of non-zero digits placed into the grid */
  totalDigits: number;
}

/**
 * Extracts individual digits from a number. Returns them as an array.
 * Example: 32 -> [3, 2], 5 -> [5], 0 -> [0]
 */
function getDigits(num: number): number[] {
  return Math.abs(num)
    .toString()
    .split('')
    .map((d) => parseInt(d, 10));
}

/**
 * Sums all digits of a number.
 * Example: 32 -> 5, 128 -> 11
 */
function sumDigits(num: number): number {
  return getDigits(num).reduce((acc, d) => acc + d, 0);
}

/**
 * Calculates the Pythagoras Psychomatrix from a birthdate.
 *
 * Algorithm:
 * 1. Collect all digits of the birthdate (day, month, year).
 * 2. 1st working number = sum of all birthdate digits.
 * 3. 2nd working number = sum of digits of the 1st working number.
 * 4. 3rd working number = 1st working number - (first non-zero digit of DAY * 2).
 * 5. 4th working number = sum of digits of the 3rd working number.
 * 6. Combine all birthdate digits + all working number digits.
 * 7. Distribute non-zero digits into a 3x3 grid (position = digit value).
 * 8. Count digits in rows, columns, and diagonals.
 */
export function calculateMatrix(
  day: number,
  month: number,
  year: number
): MatrixResult {
  // Step 1: Collect all birthdate digits
  const birthdateDigits = [
    ...getDigits(day),
    ...getDigits(month),
    ...getDigits(year),
  ];

  // Step 2: 1st working number = sum of all birthdate digits
  const wn1 = birthdateDigits.reduce((acc, d) => acc + d, 0);

  // Step 3: 2nd working number = digit sum of 1st working number
  const wn2 = sumDigits(wn1);

  // Step 4: Find first non-zero digit of the DAY, then
  // 3rd working number = 1st working number - (firstNonZeroDigitOfDay * 2)
  const dayDigits = getDigits(day);
  const firstNonZeroDigit = dayDigits.find((d) => d !== 0) ?? 1;
  const wn3 = Math.abs(wn1 - firstNonZeroDigit * 2);

  // Step 5: 4th working number = digit sum of 3rd working number
  const wn4 = sumDigits(wn3);

  // Step 6: Collect ALL digits (birthdate + working numbers)
  const workingNumberDigits = [
    ...getDigits(wn1),
    ...getDigits(wn2),
    ...getDigits(wn3),
    ...getDigits(wn4),
  ];

  const allDigits = [...birthdateDigits, ...workingNumberDigits];

  // Step 7: Distribute non-zero digits into the grid
  const grid: Record<number, number[]> = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
  };

  for (const digit of allDigits) {
    if (digit >= 1 && digit <= 9) {
      grid[digit].push(digit);
    }
    // Zeros are not placed in the grid
  }

  // Step 8: Calculate line counts
  const countAt = (pos: number): number => grid[pos].length;

  const rows: [number, number, number] = [
    countAt(1) + countAt(4) + countAt(7), // Row 1: positions 1, 4, 7
    countAt(2) + countAt(5) + countAt(8), // Row 2: positions 2, 5, 8
    countAt(3) + countAt(6) + countAt(9), // Row 3: positions 3, 6, 9
  ];

  const columns: [number, number, number] = [
    countAt(1) + countAt(2) + countAt(3), // Column 1: positions 1, 2, 3
    countAt(4) + countAt(5) + countAt(6), // Column 2: positions 4, 5, 6
    countAt(7) + countAt(8) + countAt(9), // Column 3: positions 7, 8, 9
  ];

  const diagonalDown = countAt(1) + countAt(5) + countAt(9); // 1, 5, 9
  const diagonalUp = countAt(3) + countAt(5) + countAt(7); // 3, 5, 7

  // Calculate total non-zero digits in the grid
  let totalDigits = 0;
  for (let pos = 1; pos <= 9; pos++) {
    totalDigits += grid[pos].length;
  }

  return {
    grid,
    workingNumbers: [wn1, wn2, wn3, wn4],
    lines: {
      rows,
      columns,
      diagonalDown,
      diagonalUp,
    },
    totalDigits,
  };
}
