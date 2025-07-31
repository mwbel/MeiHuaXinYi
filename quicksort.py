"""
Quicksort Algorithm Implementation

This module provides an efficient implementation of the quicksort algorithm
using the divide-and-conquer approach with in-place partitioning.

Time Complexity:
- Average case: O(n log n)
- Best case: O(n log n) 
- Worst case: O(n²) - when pivot is always the smallest or largest element

Space Complexity:
- Average case: O(log n) - due to recursion stack
- Worst case: O(n) - in case of unbalanced partitions
"""


def quicksort(arr):
    """
    Sorts a list of comparable elements using the quicksort algorithm.
    
    This function implements the quicksort algorithm using divide-and-conquer
    with in-place partitioning. The algorithm recursively partitions the array
    around a pivot element (last element) and sorts the subarrays.
    
    Args:
        arr (list): A list of comparable elements to be sorted.
                   Can contain integers, floats, strings, or any comparable type.
    
    Returns:
        list: The same list sorted in ascending order (modified in-place).
              Returns the original list reference for convenience.
    
    Examples:
        >>> numbers = [64, 34, 25, 12, 22, 11, 90]
        >>> quicksort(numbers)
        [11, 12, 22, 25, 34, 64, 90]
        
        >>> words = ['banana', 'apple', 'cherry', 'date']
        >>> quicksort(words)
        ['apple', 'banana', 'cherry', 'date']
    """
    # Handle edge cases: empty list or single element
    if len(arr) <= 1:
        return arr
    
    # Call the recursive helper function to sort the entire array
    _quicksort_recursive(arr, 0, len(arr) - 1)
    return arr


def _quicksort_recursive(arr, low, high):
    """
    Recursive helper function for quicksort algorithm.
    
    This function recursively sorts the subarray arr[low..high] by:
    1. Partitioning the array around a pivot
    2. Recursively sorting elements before the pivot
    3. Recursively sorting elements after the pivot
    
    Args:
        arr (list): The array to be sorted
        low (int): Starting index of the subarray to sort
        high (int): Ending index of the subarray to sort
    """
    # Base case: if low >= high, subarray has 0 or 1 element (already sorted)
    if low < high:
        # Partition the array and get the pivot index
        # After partitioning:
        # - Elements at indices [low..pivot_index-1] are <= pivot
        # - Element at index pivot_index is the pivot (in final position)
        # - Elements at indices [pivot_index+1..high] are > pivot
        pivot_index = _partition(arr, low, high)
        
        # Recursively sort the left subarray (elements smaller than pivot)
        _quicksort_recursive(arr, low, pivot_index - 1)
        
        # Recursively sort the right subarray (elements greater than pivot)
        _quicksort_recursive(arr, pivot_index + 1, high)


def _partition(arr, low, high):
    """
    Partitions the array around a pivot element using the last element as pivot.
    
    This function rearranges the array so that:
    - All elements smaller than or equal to the pivot are on the left
    - All elements greater than the pivot are on the right
    - The pivot is placed in its final sorted position
    
    Uses the Lomuto partition scheme for simplicity and clarity.
    
    Args:
        arr (list): The array to be partitioned
        low (int): Starting index of the subarray to partition
        high (int): Ending index of the subarray to partition
    
    Returns:
        int: The final index position of the pivot element after partitioning
    """
    # Choose the last element as the pivot
    pivot = arr[high]
    
    # Index of the smaller element, indicates the right position
    # of pivot found so far
    i = low - 1
    
    # Traverse through all elements except the pivot
    # Compare each element with pivot
    for j in range(low, high):
        # If current element is smaller than or equal to pivot,
        # increment the index of smaller element and swap
        if arr[j] <= pivot:
            i += 1  # Increment index of smaller element
            arr[i], arr[j] = arr[j], arr[i]  # Swap elements
    
    # Place the pivot in its correct position by swapping with element at i+1
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    
    # Return the position of the pivot
    return i + 1


def demonstrate_quicksort():
    """
    Demonstrates the quicksort algorithm with various examples.
    
    This function shows how quicksort works with different types of data
    and edge cases to illustrate the algorithm's versatility and robustness.
    """
    print("=== Quicksort Algorithm Demonstration ===\n")
    
    # Example 1: Integer array
    print("1. Sorting integers:")
    numbers = [64, 34, 25, 12, 22, 11, 90, 5, 77, 30]
    print(f"Original: {numbers}")
    quicksort(numbers)
    print(f"Sorted:   {numbers}\n")
    
    # Example 2: Array with duplicates
    print("2. Sorting with duplicate values:")
    duplicates = [5, 2, 8, 2, 9, 1, 5, 5]
    print(f"Original: {duplicates}")
    quicksort(duplicates)
    print(f"Sorted:   {duplicates}\n")
    
    # Example 3: String array
    print("3. Sorting strings:")
    words = ['banana', 'apple', 'cherry', 'date', 'elderberry']
    print(f"Original: {words}")
    quicksort(words)
    print(f"Sorted:   {words}\n")
    
    # Example 4: Already sorted array
    print("4. Already sorted array:")
    sorted_arr = [1, 2, 3, 4, 5]
    print(f"Original: {sorted_arr}")
    quicksort(sorted_arr)
    print(f"Sorted:   {sorted_arr}\n")
    
    # Example 5: Reverse sorted array
    print("5. Reverse sorted array:")
    reverse_arr = [5, 4, 3, 2, 1]
    print(f"Original: {reverse_arr}")
    quicksort(reverse_arr)
    print(f"Sorted:   {reverse_arr}\n")
    
    # Example 6: Edge cases
    print("6. Edge cases:")
    empty_list = []
    single_element = [42]
    two_elements = [2, 1]
    
    print(f"Empty list: {empty_list} -> {quicksort(empty_list.copy())}")
    print(f"Single element: {single_element} -> {quicksort(single_element.copy())}")
    print(f"Two elements: {two_elements} -> {quicksort(two_elements.copy())}")


if __name__ == "__main__":
    # Run the demonstration when the script is executed directly
    demonstrate_quicksort()
