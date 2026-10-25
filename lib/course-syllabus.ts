// Personal checklist of the getsdeready "Design + DSA combined" course the
// user is enrolled in. Titles only — the content itself lives on their
// course site; this just lets progress (and money) be tracked here.

export type CourseTrack = 'dsa' | 'lld' | 'hld';
export type CourseItemKind = 'reading' | 'quiz' | 'video' | 'test';

export interface CourseItem {
  id: string;
  title: string;
  kind: CourseItemKind;
}

export interface CourseSection {
  id: string;
  title: string;
  group: string;
  items: CourseItem[];
}

export const COURSE_NAME = 'getsdeready course';

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Prefixes: "Q:" quiz, "V:" video. "HackerRank Test" is detected as a test.
function section(track: CourseTrack, group: string, title: string, lines: string[]): CourseSection {
  const id = `course:${track}/${slug(group)}/${slug(title)}`;
  const seen = new Set<string>();
  const items: CourseItem[] = [];
  for (const raw of lines.length ? lines : ['Complete module']) {
    let kind: CourseItemKind = 'reading';
    let title = raw;
    if (raw.startsWith('Q:')) { kind = 'quiz'; title = raw.slice(2).trim(); }
    else if (raw.startsWith('V:')) { kind = 'video'; title = raw.slice(2).trim(); }
    else if (raw === 'HackerRank Test') kind = 'test';
    const key = `${kind}:${title.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ id: `${id}/${slug(title)}${kind === 'reading' ? '' : `-${kind}`}`, title, kind });
  }
  return { id, title, group, items };
}

const HR = 'HackerRank Test';
const LLD_STEPS = ['Requirements', 'Identification of actors', 'Use case diagram', 'Class diagram', 'QnA', 'Activity Diagram', 'Code'];
const HLD_STEPS = [
  'Introduction', 'Requirements & Goals of the System', 'Capacity Estimations & Constraints', 'System APIs',
  'Database design & Schema', 'High Level Design', 'QnA', 'Purging & Db Cleanup',
  'Database Partitioning & Replication', 'Cache & Load Balancing',
];

const D = (title: string, lines: string[]) => section('dsa', 'DSA', title, lines);

export const COURSE_DSA: CourseSection[] = [
  D('Number Theory', ['Number of Common Factors', 'Add Two Integers', 'Product of factors of number', 'Repeating GCD', 'Exponentiation', 'Factorial', 'GCD & LCM', 'Prime Numbers and Primality Check', 'Sieve of Eratosthenes', 'Binary Exponentiation', 'Modulo Arithmetic', 'Inverse Modulo', 'nCr Computations using inverse modulo', 'Find all factorial numbers less than or equal to N', 'GCD, LCM and Distributive Property', 'Product of Prime Factors', 'Find Prime numbers in a range', HR]),
  D('Math', ['Plus One', 'Sqrt(x)', 'Power of Four', 'Excel Sheet Column Title', 'Reverse Integer', 'Factorial Trailing Zeroes', 'Fibonacci Number', 'Palindrome Number', 'Check If It Is a Straight Line', 'Count Days Spent Together', 'Minimum Sum of Four Digit Number After Splitting Digits', 'Day of the Year', 'Subtract the Product and Sum of Digits of an Integer', 'Prime Arrangements', HR]),
  D('Bit Manipulation', ['Single Number', 'XOR Operation in an Array', 'Sum of All Subset XOR totals', 'Convert a number to hexadecimal', 'Prime Number of Set Bits in Binary Representation', 'Maximum XOR of Two Numbers in an Array', 'XOR Queries of a Subarray', 'Total Hamming Distance', 'Single Number II', 'Find Sum Of Different Corresponding Bits For All Pairs', 'Divide Two Integers', 'Bitwise ORs of Subarrays', 'Q:Bit Manipulation Quiz', HR]),
  D('Searching (Beginner)', ['sqrt(x)', 'Binary Search', 'Intersection of Two Array II', 'Count Negative Numbers in a Sorted Matrix', 'Check if Array is Sorted and Rotated', 'Rotate String', 'Find Peak Element', 'Single Element in a Sorted Array', 'Minimum Swaps to Sort', 'Matrix Median', 'Search in Rotated Sorted Array', 'Minimum Size Subarray Sum', 'Maximum Height Of The Staircase', 'Median Of Two Sorted Arrays', 'Q:Searching Quiz', HR]),
  D('Searching (Advanced)', ['Reach a Number', 'Most Profit Assigning Work', 'Ways to Split Array Into Three Subarrays', 'Plates between Candles', 'Aggressive Cows', 'Smallest Good Base', 'Allocate Books', 'Nth Magical Number', 'Painters Partition Problem', 'Matrix Search', 'Rotate Image', 'Find Minimum In Rotated Sorted Array', HR]),
  D('Recursion', ['Fibonacci Number', 'Power of Four', 'Merge Two Sorted Lists', 'Power of Two', 'All Unique Permutations', 'Combination Sum', 'Permutations', 'Subsets', 'Combination Sum ii', 'Gray Code', 'Subsets ii', 'Permutation Sequence', 'Find the Winner of the Circular Game', 'Q:Recursion Quiz', HR]),
  D('Backtracking', ['Sum of All Subset XOR Totals', 'Binary Watch', 'Letter Tile Possibilities', 'Generate Parantheses', 'Unique Paths III', 'NQueens', 'Permutations II', 'Number Of Squareful Arrays', 'Palindrome Partitioning', 'Gray Code', 'N-Queens II', 'Numbers With Same Consecutive Differences', 'Q:Backtracking Quiz', HR]),
  D('Sorting (Beginner)', ['Third Largest Number', 'Sort Array By Parity II', 'How Many Numbers are smaller than the current Number?', 'Fair Candy Swap', 'K Closest Points to Origin', 'Maximum Difference', 'Maximum Difference Between Increasing Elements', 'Number of sextuplets', 'Corporate Flight Bookings', 'Chocolate Distribution Problem', 'Sum Special Triplets Elements 3 Arrays', 'Find Right Interval', 'Q:Sorting Algorithms Quiz', HR]),
  D('Sorting (Advanced)', ['Find the Distance value between Two Arrays', 'Merge Similar items', 'Split with Minimum Sum', 'Sort Even and Odd Indices Independently', 'Count of smaller numbers after self', 'Count of Range Sum', 'Reverse pairs', 'Lexicographically largest permutation of the array such that a[i] = a[i-1] + gcd(a[i-1], a[i-2])', 'Possible Arrangement Of Persons Waiting To Sit In A Hall', 'Inversion count in an array', 'Max Chunks To Make Sorted II', 'Reducing Dishes', HR]),
  D('Two Pointer', ['Find the Index of the First Occurrence in a String', 'Is Subsequence?', 'Check if N and its Double exist', 'Squares of a Sorted Array', 'Count of pairs with the given sum', 'Minimum Size Subarray Sum', 'Minimize the absolute difference', 'Smallest sequence with given Primes', 'Container With Most Water', 'Given Two Sorted Arrays Number X Find Pair Whose Sum Closest X', 'Counting Triangles', 'Trapping Rain Water', 'Longest Chunked Palindrome Decomposition', 'Q:Two-Pointer Approach Quiz', HR]),
  D('Hashing (Beginner)', ['Two Sum', 'Find the Difference', 'Fair Candy Swap', 'Maximum Number of Ballons', 'Subarray with 0 sum', 'Subarray Sum Equals K', 'Largest Continuous Sequence Zero Sum', 'Longest Consecutive Sequence', 'Equal', 'Anagrams', 'Valid Sudoku', 'Set Matrix Zeros', 'Find Pairs In Array Whose Sums Already Exist In Array', 'Q:Hashing Quiz']),
  D('Hashing (Advanced)', ['Check if N and its Double exist', 'How many Numbers are Smaller than the current number', 'Sum of Unique Elements', 'Decode the Message', 'Palindrome Pairs', 'Window String', 'Longest Substring Without Repeat', 'Points on same line', 'Count Right Triangles', 'Diffk ii', 'Grid Illumination', 'Find rectangle with corners as 1', 'Random Pick with Blacklist', HR]),
  D('Strings', ['Repeated Substring Pattern', 'Valid Palindrome II', 'Find Common characters', 'Check if a word occurs as a Prefix of any word in a sentence', 'Day of the Year', 'Longest Common Prefix', 'Compare Version Numbers', 'Reverse the String', 'Implement Strstr', 'Integer To Roman', 'Roman To Integer', 'Pretty Json', 'Q:String Operations Quiz', HR]),
  D('Stacks', ['Valid Parentheses', 'Next Greater Element I', 'Number of Students unable to eat Lunch', 'Remove all Adjacent Duplicates in String', 'Evaluate Expression', 'Min Stack', 'Largest Rectangle in Histogram', 'Trapping Rain Water', 'Nearest Smaller Element', 'Brace Expansion II', 'Maximal Rectangle', 'Q:Stack Operations Quiz', HR]),
  D('Queues', ['Implement Stack using Queues', 'First Unique Character in a String', 'Implement Queue using Stacks', 'Time needed to Buy Tickets', 'Sum of min and max', 'Reversing the first K elements of a Queue', 'N integers containing only 1, 2 & 3', 'Gas Station', 'Sliding Window Maximum', 'Given A String Find Its First Non Repeating Character', 'Max Value of Equation', 'Shortest Subarray with Sum at Least K', 'Q:Queues Quiz', HR]),
  D('Linked List (Beginner)', ['Merge Two Sorted Lists', 'Palindrome Linked List', 'Intersection of Two Linked Lists', 'Middle of the Linked List', 'Remove Nth Node From End of List', 'List Cycle', 'Reverse Linked List Ii', 'Populating Next Right Pointers in Each Node', 'Q:Linked List Quiz', HR]),
  D('Linked List (Advanced)', ['Design Hashmap', 'Remove Duplicates from Sorted List', 'Linked List Cycle', 'Merge Two Sorted Lists', 'Flatten a Multilevel Doubly Linked List', 'Clone a Linked List', 'Intersection of Linked Lists', 'Remove Duplicates From Sorted List ii', 'Length Longest Palindrome List Linked List Using O(1) Extra Space', 'Design a Text Editor', 'Q:Linked List Quiz 2']),
  D('Trees (Beginner)', ['Same Tree', 'Maximum Depth of Binary Tree', 'Binary Tree Inorder Traversal', 'Binary Tree Preorder Traversal', 'Binary Tree Postorder Traversal', 'Binary Tree From Inorder And Postorder', 'Balanced Binary Tree', 'Check Tree Traversal', 'Binary Tree Zigzag Level Order Traversal', 'Construct Binary Tree From Preorder And Inorder Traversal', 'Binary Tree Level Order Traversal', 'Populating Next Right Pointers in Each Node', HR]),
  D('Trees (Intermediate)', ['Symmetric Tree', 'Invert Binary Tree', 'Binary Tree Tilt', 'Evaluate Boolean Binary Tree', 'Vertical Order traversal', 'Binary Tree Right Side View', 'Sum Tree', '2-Sum Binary Tree', 'TOP VIEW', 'Boundary Traversal Of Binary Tree', 'Add One Row to Tree', 'Serialize and Deserialize Binary Tree']),
  D('Trees & BST', ['Convert Sorted Array to BST', 'Find Mode in BST', 'Minimum Absolute difference in BST', 'Two Sum IV - Input is a BST', 'Search in a BST', 'Kth Largest Element in a Stream', 'Recover Binary Search Tree', 'Sorted Array To Balanced BST', 'BST Iterator', 'Left view of binary tree', 'Least Common Ancestor', 'Invert the Binary Tree', 'Valid Binary Search Tree', 'Binary Tree to CDLL', 'Sum Root To Leaf Numbers', 'Symmetric Binary Tree', 'Identical Binary Trees', 'Path Sum']),
  D('BST (Advanced)', ['Minimum Distance between BST nodes', 'Increasing order BST', 'Range Sum of BST', 'Leaf nodes from Preorder of a Binary Search Tree', 'Odd even level difference', 'Minimum Distance between Nodes of BST', 'Boundary Traversal Of Binary Tree', '2sum Binary Tree', 'Binary Tree Paths', 'All Nodes Distance K In Binary Tree', 'Q:Binary Search Tree (BST) Quiz']),
  D('Heap', ['Take Gifts from the Richest Pile', 'Delete greatest value in each row', 'Make Array zero by Subtracting equal amounts', 'Minimum amount of time to fill cups', 'N max pair combinations', 'Kth Largest Element in an Array', 'Merge k Sorted Lists', 'B Closest Points to Origin', 'Ways To Form Max Heap', 'Magician And Chocolates', 'Sliding Window Median', 'Q:Binary Heap Quiz', HR]),
  D('Greedy', ['Largest Perimeter Triangle', 'Longest Palindrome', 'Maximum Sum with exactly K elements', 'Minimum Moves to convert string', 'Maximize Sum Of Array After K Negations', 'Assign Mice to Holes', 'Seats', 'Meeting rooms', 'Job Sequencing Problem', 'Task Scheduler', 'Kth Smallest Element In A Sorted Matrix', 'Minimum Number of Refueling Stops', 'Reducing Dishes', 'Q:Greedy Algorithm Quiz']),
  D('Dynamic Programming (Beginner)', ["Pascal's Triangle", 'Best time to Buy and Sell Stock', 'Fibbonacci Number', 'Best Time to Buy and Sell Stock II', 'House Robber', 'Climbing Stairs', 'Length of Longest Fibonacci Subsequence', 'Min Jumps Array', 'Coins in a Line', 'Longest Increasing Subsequence', 'Tiling A Rectangle With The Fewest Squares', 'Max Sum Without Adjacent Elements', 'Q:Dynamic Programming Quiz']),
  D('Dynamic Programming (Intermediate)', ["Pascal's Triangle II", 'Counting Bits', 'Is Subsequence?', 'Perfect Squares', 'Minimum cost for tickets', 'Min Sum Path in Matrix', 'Longest Palindromic Subsequence', 'Longest Common Subsequence', 'Longest Increasing Subsequence', 'Unique Paths In A Grid', 'Coin Sum Infinite', 'Coins In A Line', 'Regular Expression Matching', 'Q:Dynamic Programming Concepts']),
  D('Dynamic Programming (Advanced)', ['Divisor Game', 'N-th Tribonacci Number', 'Get Maximum in Generated Array', 'Predict the Winner', 'Maximum length of Pair Chain', 'Longest String chain', 'Minimum Time to make Rope colorful', 'Nth Fibbonacci Number', 'Edit Distance', 'Word Break', 'Regular Expression Matching', 'Regular Expression ii', 'Interleaving String', 'Palindrome Partitioning II', 'Longest Palindromic Substring', 'Matrix chain multiplication', 'Unique Binary Search Trees ii', 'Tushars Birthday Party', 'Distinct Subsequences', 'Evaluate Expression To True', 'Russian Doll Envelopes', 'Word Break II', 'Q:Stock Trading Dynamic Programming Problems']),
  D('Graph (Beginner)', ['Find if Path exists in Graph', 'Find Center of Star Graph', 'Island Perimeter', 'Minimum Depth of Binary Tree', 'Rotting Oranges', 'Capture Regions on Board', 'Black Shapes', 'Frog Position After T Seconds', 'Smallest Multiple With 0 And 1', 'Number Of Islands', 'Jump Game IV', 'Shortest Path Visiting All Nodes', 'Q:Graph Theory Concepts', 'Q:Graph Types and Algorithms']),
  D('Graph (Advanced)', ['Min Cost to Connect All points', 'Find All Possible recipes from Given Supplies', 'All Ancestos of a Node in a Directed Acyclic Graph', 'Number of Provinces', 'Possibility of finishing all courses given pre-requisites', 'Commutable Islands', 'Knight On Chess Board', 'Dijkstra', 'Word Ladder I', 'Word Ladder II', 'Is Graph Bipartite?', 'Q:Graph Algorithms']),
  D('Trie', ['Longest Common Prefix', 'Shortest Unique Prefix', 'Maximum XOR of Two Numbers in an Array', 'Subarrays Xor Less Than B', 'Distinct Echo Substrings', 'Concatenated Words']),
  D('Segment Tree', ['Good Ranges', 'Falling Squares', 'Bob and Queries', 'Number of Longest Increasing Subsequence', 'Range Frequency Queries']),
];

const L = (group: string, title: string, lines: string[]) => section('lld', group, title, lines);

export const COURSE_LLD: CourseSection[] = [
  L('Fundamentals', 'Building Blocks', ['Inheritence', 'Association', 'Composition', 'Aggregation', 'Q:LLD Quiz']),
  L('Fundamentals', 'SOLID Principles', ['Single Responsibility Principle', 'Open closed Principle', 'Dependency Inversion Principle', "Liskov's substitution Principle", 'Interface Segregation Principle', 'Q:SOLID Principles Quiz']),
  L('Design Patterns', 'Creational Design Patterns', ['Factory', 'Abstract Factory', 'Builder', 'Singleton', 'Q:Creational Design Quiz']),
  L('Design Patterns', 'Structural Design Patterns', ['Decorator', 'Facade', 'Adapter', 'Bridge', 'Q:Structural Design Quiz']),
  L('Design Patterns', 'Behavioural Design Patterns', ['Command', 'Observer', 'State', 'Strategy', 'Q:Behavioural Design Quiz']),
  L('Basic Case Studies', 'Pizza Factory', LLD_STEPS),
  L('Basic Case Studies', 'SQL Query Builder', LLD_STEPS),
  L('Basic Case Studies', 'Logger', ['V:Introduction & Class Diagram', 'V:Code Part 01', 'V:Singleton Logger', 'V:Code Part 02', ...LLD_STEPS]),
  L('Basic Case Studies', 'Car Price Calculator', ['V:Chapter 1', 'V:Chapter 2', 'V:Chapter 3', 'V:Chapter 4', 'V:Chapter 5', ...LLD_STEPS]),
  L('Basic Case Studies', 'Weather Station', LLD_STEPS),
  L('Intermediate Case Studies', 'Ticket Management System', LLD_STEPS),
  L('Intermediate Case Studies', 'Payment Processor', ['V:Chapter 1', 'V:Chapter 2', 'V:Chapter 3', 'V:Chapter 4', ...LLD_STEPS]),
  L('Intermediate Case Studies', 'Elevator System', LLD_STEPS),
  L('Intermediate Case Studies', 'Car Parking', [
    'V:Introduction Video', 'V:Use Case Diagram', 'V:Class Diagram', 'V:Class Diagram continued', 'V:Services',
    'V:Parking Service', 'V:Discussion on Parking Spots and Parking Service', 'V:Activity Diagram', 'V:Coding Part 1',
    'V:How to add Logging in the system', 'V:Coding Part 2 (Adding Logging)', 'V:Parking Spots using Decorator pattern',
    'V:Coding Part 3', ...LLD_STEPS,
  ]),
  L('Advanced Case Studies', 'Social Media', LLD_STEPS),
  L('Advanced Case Studies', 'WhatsApp', LLD_STEPS),
  L('Advanced Case Studies', 'Amazon', LLD_STEPS),
  L('Assignments', 'Assignments', ['Design Patterns', 'Snakes and Ladders Game Implementation']),
];

const H = (group: string, title: string, lines: string[]) => section('hld', group, title, lines);

export const COURSE_HLD: CourseSection[] = [
  H('Fundamentals', 'Building Blocks', ['What is HLD?', 'Consistent Hashing', 'Caching', 'Load Balancing', 'CAP Theorem', 'Indexes', 'Redundancy and Replication', 'SQL vs NoSQL', 'Data Partitioning', 'Long Polling and WebSockets', 'Retrieval Augmented Generation (RAG)', 'Gen AI-enabled API Systems', 'Quorum']),
  H('Basic Case Studies', 'URL Shortener (TinyURL)', HLD_STEPS),
  H('Basic Case Studies', 'Rate Limiter', HLD_STEPS),
  H('Intermediate Case Studies', 'Typeahead Suggestion', HLD_STEPS),
  H('Intermediate Case Studies', 'Pastebin', HLD_STEPS),
  H('Advanced Case Studies', 'Dropbox', HLD_STEPS),
  H('Advanced Case Studies', "Facebook's Newsfeed", HLD_STEPS),
  H('Advanced Case Studies', 'Instagram', HLD_STEPS),
  H('Advanced Case Studies', 'Facebook Messenger', HLD_STEPS),
  H('Advanced Case Studies', 'Ticket Booking (BookMyShow)', HLD_STEPS),
];

export const COURSE: Record<CourseTrack, CourseSection[]> = {
  dsa: COURSE_DSA,
  lld: COURSE_LLD,
  hld: COURSE_HLD,
};
