1. What are LIMIT and OFFSET in SQL?

LIMIT tells SQL how many records to return.

OFFSET tells SQL how many records to skip before starting.

The formula I used is:

OFFSET = (page - 1) × limit

For 47 products, 8 products per page, and Page 3:

LIMIT = 8

OFFSET = (3 - 1) × 8
       = 2 × 8
       = 16

So the exact SQL values are:

LIMIT 8 OFFSET 16

This means SQL skips the first 16 products and returns the next 8 products for Page 3.

Simple mentor answer:

LIMIT decides how many products are returned, and OFFSET decides where the page starts. For Page 3 with 8 products per page, I use LIMIT 8 and OFFSET 16.

2. How does useDebounce work?

I created a custom useDebounce hook to prevent the search API from being called on every keystroke.

I use it like this:

const debouncedSearch = useDebounce(search, 300);

When the user types:

phone

the normal search state changes immediately, but debouncedSearch waits for 300 milliseconds.

Inside the hook:

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedValue(value);
  }, delay);

  return () => {
    clearTimeout(timer);
  };
}, [value, delay]);

The cleanup:

return () => {
  clearTimeout(timer);
};

cancels the previous timer whenever the user types another character.

For example:

p     → timer starts
ph    → old timer cancelled
pho   → old timer cancelled
phon  → old timer cancelled
phone → wait 300ms
             ↓
         API request

This is important because it reduces unnecessary API calls and improves application performance.

Simple mentor answer:

useDebounce waits 300 milliseconds after the user stops typing. clearTimeout() cancels the previous timer whenever the search value changes, so the API is not called for every keystroke.

3. Why reset currentPage to 1 when the search term changes?

I use:

useEffect(() => {
  setCurrentPage(1);
}, [debouncedSearch]);

Suppose the user is currently on:

Page 4

Then they search for:

phone

The search might have only one page of results.

If I keep currentPage as Page 4, the API could return no products even though matching products exist on Page 1.

So whenever the search changes, I reset pagination to:

Page 1

Simple mentor answer:

I reset the page to 1 because a new search may have fewer pages. This ensures the user always starts from the first page of the new search results.

4. What props does the Pagination component accept?

My reusable Pagination component accepts three main props:

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>

They are:

currentPage
→ Current active page

totalPages
→ Total number of available pages

onPageChange
→ Function used to change the page

The parent component owns the page state:

const [currentPage, setCurrentPage] = useState(1);

The Pagination component does not directly fetch products or control the data.

When the user clicks Page 2:

User clicks Page 2
        ↓
Pagination calls onPageChange(2)
        ↓
Parent runs setCurrentPage(2)
        ↓
currentPage becomes 2
        ↓
useEffect runs
        ↓
API requests page=2
        ↓
Page 2 products are displayed

This makes the Pagination component reusable. Different parent pages can use the same component while maintaining their own currentPage state.



My Pagination component accepts currentPage, totalPages, and onPageChange. The parent owns the currentPage state and passes it to Pagination. When a page button is clicked, Pagination calls onPageChange, and the parent updates the active page.



In Task 15, I implemented server-side pagination using SQL LIMIT and OFFSET. For example, Page 3 with 8 products per page uses LIMIT 8 and OFFSET 16. I also created a custom useDebounce hook with a 300-millisecond delay. Its cleanup function clears the previous timer, which prevents API calls on every keystroke. When the search changes, I reset the current page to Page 1. Finally, I created a reusable Pagination component using currentPage, totalPages, and onPageChange props.