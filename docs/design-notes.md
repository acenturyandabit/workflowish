# why the item tree doesn't use `useContext()`
1. Better encapsulation (children can't modify arbitrary items)
2. It's actually not that much less readable once controller.tsx is refactored, and the memory usage isn't that big an issue
3. React means the entire tree has to re-render on update anyway, so we don't save much in terms of processing power (same big O)
Invalid points
-  It's more idiomatic react; worrying about global state makes it harder to test (not that we have many tests anyway)
- search-transform preprocessing works better - but we could give it it's own context
- Updates don't have to propagate up the entire tree - we can do this the current way as well; also this is premature optimization