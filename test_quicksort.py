"""
Unit tests for the quicksort algorithm implementation.

This module contains comprehensive tests to verify the correctness,
edge case handling, and performance characteristics of the quicksort algorithm.
"""

import unittest
import random
import time
from quicksort import quicksort, _partition


class TestQuicksort(unittest.TestCase):
    """Test cases for the quicksort algorithm."""
    
    def test_empty_list(self):
        """Test sorting an empty list."""
        arr = []
        result = quicksort(arr)
        self.assertEqual(result, [])
        self.assertEqual(arr, [])  # Verify in-place modification
    
    def test_single_element(self):
        """Test sorting a list with a single element."""
        arr = [42]
        result = quicksort(arr)
        self.assertEqual(result, [42])
        self.assertEqual(arr, [42])
    
    def test_two_elements_unsorted(self):
        """Test sorting two unsorted elements."""
        arr = [2, 1]
        result = quicksort(arr)
        self.assertEqual(result, [1, 2])
        self.assertEqual(arr, [1, 2])
    
    def test_two_elements_sorted(self):
        """Test sorting two already sorted elements."""
        arr = [1, 2]
        result = quicksort(arr)
        self.assertEqual(result, [1, 2])
        self.assertEqual(arr, [1, 2])
    
    def test_basic_integer_sorting(self):
        """Test sorting a basic list of integers."""
        arr = [64, 34, 25, 12, 22, 11, 90]
        expected = [11, 12, 22, 25, 34, 64, 90]
        result = quicksort(arr)
        self.assertEqual(result, expected)
        self.assertEqual(arr, expected)
    
    def test_duplicate_elements(self):
        """Test sorting with duplicate elements."""
        arr = [5, 2, 8, 2, 9, 1, 5, 5]
        expected = [1, 2, 2, 5, 5, 5, 8, 9]
        result = quicksort(arr)
        self.assertEqual(result, expected)
        self.assertEqual(arr, expected)
    
    def test_already_sorted(self):
        """Test sorting an already sorted array."""
        arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        result = quicksort(arr)
        self.assertEqual(result, expected)
        self.assertEqual(arr, expected)
    
    def test_reverse_sorted(self):
        """Test sorting a reverse sorted array."""
        arr = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
        expected = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        result = quicksort(arr)
        self.assertEqual(result, expected)
        self.assertEqual(arr, expected)
    
    def test_all_same_elements(self):
        """Test sorting an array with all identical elements."""
        arr = [5, 5, 5, 5, 5]
        expected = [5, 5, 5, 5, 5]
        result = quicksort(arr)
        self.assertEqual(result, expected)
        self.assertEqual(arr, expected)
    
    def test_negative_numbers(self):
        """Test sorting with negative numbers."""
        arr = [-3, 1, -7, 4, -2, 0, 8]
        expected = [-7, -3, -2, 0, 1, 4, 8]
        result = quicksort(arr)
        self.assertEqual(result, expected)
        self.assertEqual(arr, expected)
    
    def test_floating_point_numbers(self):
        """Test sorting floating point numbers."""
        arr = [3.14, 2.71, 1.41, 0.57, 2.23]
        expected = [0.57, 1.41, 2.23, 2.71, 3.14]
        result = quicksort(arr)
        self.assertEqual(result, expected)
        self.assertEqual(arr, expected)
    
    def test_string_sorting(self):
        """Test sorting strings."""
        arr = ['banana', 'apple', 'cherry', 'date']
        expected = ['apple', 'banana', 'cherry', 'date']
        result = quicksort(arr)
        self.assertEqual(result, expected)
        self.assertEqual(arr, expected)
    
    def test_large_random_array(self):
        """Test sorting a large random array."""
        # Generate a large random array
        arr = [random.randint(1, 1000) for _ in range(1000)]
        original = arr.copy()
        
        # Sort using quicksort
        result = quicksort(arr)
        
        # Sort using Python's built-in sort for comparison
        expected = sorted(original)
        
        self.assertEqual(result, expected)
        self.assertEqual(arr, expected)
    
    def test_in_place_modification(self):
        """Test that the function modifies the list in-place."""
        arr = [3, 1, 4, 1, 5, 9, 2, 6]
        original_id = id(arr)
        result = quicksort(arr)
        
        # Verify that the same list object is returned
        self.assertIs(result, arr)
        self.assertEqual(id(arr), original_id)
        self.assertEqual(arr, [1, 1, 2, 3, 4, 5, 6, 9])
    
    def test_partition_function(self):
        """Test the partition helper function."""
        arr = [10, 80, 30, 90, 40, 50, 70]
        # Last element (70) will be the pivot
        pivot_index = _partition(arr, 0, len(arr) - 1)
        
        # Check that pivot is in correct position
        pivot_value = arr[pivot_index]
        
        # All elements to the left should be <= pivot
        for i in range(pivot_index):
            self.assertLessEqual(arr[i], pivot_value)
        
        # All elements to the right should be > pivot
        for i in range(pivot_index + 1, len(arr)):
            self.assertGreater(arr[i], pivot_value)


class TestQuicksortPerformance(unittest.TestCase):
    """Performance tests for the quicksort algorithm."""
    
    def test_performance_comparison(self):
        """Compare quicksort performance with Python's built-in sort."""
        # Generate a moderately large random array
        size = 10000
        arr1 = [random.randint(1, 10000) for _ in range(size)]
        arr2 = arr1.copy()
        
        # Time quicksort
        start_time = time.time()
        quicksort(arr1)
        quicksort_time = time.time() - start_time
        
        # Time Python's built-in sort
        start_time = time.time()
        arr2.sort()
        builtin_time = time.time() - start_time
        
        # Verify both produce the same result
        self.assertEqual(arr1, arr2)
        
        # Print timing information (for educational purposes)
        print(f"\nPerformance comparison for {size} elements:")
        print(f"Quicksort time: {quicksort_time:.4f} seconds")
        print(f"Built-in sort time: {builtin_time:.4f} seconds")
        print(f"Ratio (quicksort/builtin): {quicksort_time/builtin_time:.2f}")
        
        # Our quicksort should be reasonably fast (within 10x of built-in)
        self.assertLess(quicksort_time, builtin_time * 10)


def run_interactive_tests():
    """Run some interactive demonstrations of the quicksort algorithm."""
    print("=== Interactive Quicksort Tests ===\n")
    
    # Test with user-friendly examples
    test_cases = [
        ([64, 34, 25, 12, 22, 11, 90], "Random integers"),
        ([5, 5, 5, 5], "All identical"),
        ([1], "Single element"),
        ([], "Empty list"),
        (['zebra', 'apple', 'banana', 'cherry'], "Strings"),
        ([3.14, 1.41, 2.71, 0.57], "Floating point"),
        ([-5, -1, -10, 3, 0], "Mixed positive/negative"),
    ]
    
    for arr, description in test_cases:
        original = arr.copy()
        print(f"{description}:")
        print(f"  Before: {original}")
        quicksort(arr)
        print(f"  After:  {arr}")
        print()


if __name__ == "__main__":
    # Run interactive tests first
    run_interactive_tests()
    
    # Then run unit tests
    print("=== Running Unit Tests ===")
    unittest.main(verbosity=2)
