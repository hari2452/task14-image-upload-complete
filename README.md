# Task 15 – Pagination + Debounced Search

## Project Overview

In Task 15, I upgraded the existing Product Image Upload System by adding:

- Server-side pagination
- MySQL LIMIT and OFFSET
- Reusable React Pagination component
- Debounced product search
- Custom useDebounce hook
- 300ms search delay
- Reduced unnecessary API calls

---

## Technologies Used

### Frontend
- React
- Vite
- Axios
- React Router
- Custom React Hooks

### Backend
- Python
- Flask
- MySQL

---

## 1. Server-Side Pagination

Instead of loading all products at once, the backend returns only the products required for the selected page.

Example API:

GET /api/products?page=1&limit=8&search=

The backend returns:

- products
- total
- page
- limit
- total_pages

---

## 2. LIMIT and OFFSET

LIMIT decides how many products are returned.

OFFSET decides where MySQL should start reading the products.

Formula:

OFFSET = (page - 1) × limit

Example with 8 products per page:

Page 1:
LIMIT 8 OFFSET 0

Page 2:
LIMIT 8 OFFSET 8

Page 3:
LIMIT 8 OFFSET 16

So Page 3 starts after the first 16 products.

---

## 3. Debounced Search

I created a custom useDebounce hook.

Example:

const debouncedSearch = useDebounce(search, 300);

The hook waits 300 milliseconds after the user stops typing before updating the search value.

This prevents an API request from being sent for every keystroke.

Example:

Without debounce:

p → API call
ph → API call
pho → API call
phon → API call
phone → API call

With debounce:

phone → wait 300ms → API call

---

## 4. clearTimeout Cleanup

Inside the useDebounce hook, I use:

return () => {
  clearTimeout(timer);
};

When the user types another character before 300ms, the previous timer is cancelled.

A new timer then starts for the latest search value.

This reduces unnecessary API calls.

---

## 5. Reset Search to Page 1

When the search value changes, the current page is reset to Page 1.

Example:

useEffect(() => {
  setCurrentPage(1);
}, [debouncedSearch]);

This is required because the user may be on Page 3 or Page 4, but the new search result may contain only one page.

---

## 6. Reusable Pagination Component

I created:

src/components/Pagination.jsx

The component receives three props:

- currentPage
- totalPages
- onPageChange

Example:

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={setCurrentPage}
/>

Home.jsx owns the current page state.

When the user clicks another page, currentPage changes and React requests that page from the Flask API.

---

## Pagination Flow

User clicks Page 2
        ↓
currentPage becomes 2
        ↓
useEffect runs
        ↓
React calls Flask API
        ↓
Flask calculates OFFSET
        ↓
MySQL returns Page 2 products
        ↓
React displays the products

---

## Search Flow

User types product name
        ↓
search state updates
        ↓
useDebounce waits 300ms
        ↓
debouncedSearch updates
        ↓
Page resets to 1
        ↓
API request is sent
        ↓
Flask searches MySQL
        ↓
Matching products are displayed

---

## Testing

I tested:

- Page 1 product loading
- Page 2 product loading
- Previous button
- Next button
- Active page number
- Page X of Y
- Product search
- 300ms debounce
- Search reset to Page 1
- API requests using Browser Network tab

---

## Conclusion

Task 15 improved the performance of the product listing.

Pagination prevents loading all products at once, while debounced search prevents unnecessary API calls on every keystroke.

This helped me understand server-side pagination, LIMIT, OFFSET, reusable React components, custom hooks, and frontend-backend integration.